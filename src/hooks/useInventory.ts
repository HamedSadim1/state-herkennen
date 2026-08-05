import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useDeferredValue,
} from "react";
import {
  Product,
  SortConfig,
  FilterConfig,
  StockFilterType,
} from "../types/product";
import {
  sortProducts,
  filterProducts,
  saveProductsToStorage,
  loadProductsFromStorage,
  LoadProductsResult,
  DEFAULT_FILTERS,
  STORAGE_KEY,
  hasActiveFilters,
  getActiveStockFilter,
} from "../utils/productUtils";
import { generateId } from "../utils/formatters";
import { useToast } from "../components/toast-context";

interface DeletedEntry {
  product: Product;
  index: number;
}

/**
 * Owns the full inventory state machine: the product list, the edit target,
 * sorting, filtering, localStorage persistence, the undo memories and the
 * derived visible list. `Table` only wires the results to the UI; every
 * mutation flows through the callbacks returned here.
 */
export const useInventory = (initialProducts: Product[]) => {
  // Loaded once on mount; the flag lets the mount effect warn the user when
  // their stored data was unusable and got replaced by the sample data.
  const [initialLoadResult] = useState<LoadProductsResult>(() =>
    loadProductsFromStorage()
  );
  const didWarnCorruptRef = useRef(false);

  // Mirrors the first-run seed behaviour; shared by the initializer and the
  // "Reset data" action so ids are always generated the same way.
  const seedWithFreshIds = useCallback(
    (): Product[] => initialProducts.map((p) => ({ ...p, id: generateId() })),
    [initialProducts]
  );

  const [productList, setProductList] = useState<Product[]>(() =>
    initialLoadResult.products.length > 0
      ? initialLoadResult.products
      : seedWithFreshIds()
  );

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "name",
    direction: "asc",
  });
  const [filterConfig, setFilterConfig] =
    useState<FilterConfig>(DEFAULT_FILTERS);

  // Last known-good list, kept so an import can be undone from its toast.
  const previousProductsRef = useRef<Product[]>([]);

  // Deleted products (with their position) keyed by id, so every Undo toast
  // restores exactly the product it belongs to — even after several deletes.
  const deletedProductsRef = useRef<Map<string, DeletedEntry>>(new Map());

  const { notify } = useToast();

  // Warn once when the stored inventory couldn't be read (corrupt/older data)
  // and the app silently fell back to the sample data.
  useEffect(() => {
    if (initialLoadResult.hadCorruptData && !didWarnCorruptRef.current) {
      didWarnCorruptRef.current = true;
      notify(
        "error",
        "Saved inventory data was unreadable and has been replaced with the sample data."
      );
    }
  }, [initialLoadResult.hadCorruptData, notify]);

  // Save to localStorage whenever productList changes; surface failures so the
  // user isn't silently losing their changes.
  useEffect(() => {
    const saved = saveProductsToStorage(productList);
    if (!saved) {
      notify(
        "error",
        "Could not save changes — browser storage is full or unavailable."
      );
    }
  }, [productList, notify]);

  // Keep multiple open tabs in sync: when another tab writes to storage, adopt
  // its list and discard undo memories that now point at a stale list.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setProductList(loadProductsFromStorage().products);
      setEditingProduct(null);
      previousProductsRef.current = [];
      deletedProductsRef.current.clear();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleAddProduct = useCallback((newProduct: Product) => {
    setProductList((prev) => [...prev, newProduct]);
  }, []);

  const startEditing = useCallback((product: Product) => {
    setEditingProduct(product);
  }, []);

  const handleUpdateProduct = useCallback((updatedProduct: Product) => {
    setProductList((prev) =>
      prev.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setEditingProduct(null);
  }, []);

  const handleDeleteProduct = useCallback(
    (productId: string) => {
      const index = productList.findIndex((p) => p.id === productId);
      const product = productList[index];
      if (product) {
        deletedProductsRef.current.set(productId, { product, index });
      }
      setProductList((prev) => prev.filter((p) => p.id !== productId));
      // Deleting the product being edited would leave a "ghost edit"
      // (Update silently does nothing) — clear it.
      setEditingProduct((prev) => (prev?.id === productId ? null : prev));
    },
    [productList]
  );

  // Restores the deleted product at (or near) its original position. Keyed by
  // product id so the Undo action on an earlier toast still restores the right
  // product after later deletes.
  const handleUndoDelete = useCallback((productId: string) => {
    const entry = deletedProductsRef.current.get(productId);
    if (!entry) return;
    setProductList((prev) => {
      const at = Math.min(entry.index, prev.length);
      return [...prev.slice(0, at), entry.product, ...prev.slice(at)];
    });
    deletedProductsRef.current.delete(productId);
  }, []);

  const handleImportProducts = useCallback((importedProducts: Product[]) => {
    // Remember the current inventory so the import can be undone.
    setProductList((prev) => {
      previousProductsRef.current = prev;
      return importedProducts;
    });
    // The imported inventory replaces the list, so an in-progress edit would
    // target a product that no longer exists.
    setEditingProduct(null);
  }, []);

  const handleUndoImport = useCallback(() => {
    setProductList(previousProductsRef.current);
    // The restored list may not contain the product being edited, and any
    // delete undo now refers to a stale list as well.
    setEditingProduct(null);
    deletedProductsRef.current.clear();
  }, []);

  // Restores the original sample data (mirrors the first-run seed behaviour).
  const handleResetData = useCallback(() => {
    setProductList(seedWithFreshIds());
    setEditingProduct(null);
    // Clear both undo memories so a still-visible Undo toast can't restore
    // a list that the reset intentionally replaced.
    deletedProductsRef.current.clear();
    previousProductsRef.current = [];
  }, [seedWithFreshIds]);

  const handleCancelEdit = useCallback(() => {
    setEditingProduct(null);
  }, []);

  const handleSortChange = useCallback((config: SortConfig) => {
    setSortConfig(config);
  }, []);

  // Applying a filter config also ends an in-progress edit when the edited
  // product no longer matches — the form would otherwise target a row the
  // user can't see. Handled here (not in an effect) so state always updates
  // in the same event as the filter change.
  const applyFilterConfig = useCallback((next: FilterConfig) => {
    setFilterConfig(next);
    setEditingProduct((prev) =>
      prev && filterProducts([prev], next).length === 0 ? null : prev
    );
  }, []);

  const handleFilterChange = useCallback(
    (config: FilterConfig) => applyFilterConfig(config),
    [applyFilterConfig]
  );

  const handleResetFilters = useCallback(() => {
    applyFilterConfig(DEFAULT_FILTERS);
  }, [applyFilterConfig]);

  // Dashboard card -> filter shortcuts. "all" clears everything; the stock
  // cards toggle their own filter (clicking the active card turns it off).
  const handleFilterByStock = useCallback(
    (type: StockFilterType) => {
      if (type === "all") {
        applyFilterConfig(DEFAULT_FILTERS);
        return;
      }
      applyFilterConfig({
        ...filterConfig,
        showInStockOnly: type === "inStock" && !filterConfig.showInStockOnly,
        showLowStockOnly: type === "lowStock" && !filterConfig.showLowStockOnly,
        showOutOfStockOnly:
          type === "outOfStock" && !filterConfig.showOutOfStockOnly,
      });
    },
    [filterConfig, applyFilterConfig]
  );

  // The list reflects the deferred search term: the input stays responsive
  // while filtering/sorting work is deferred until typing settles. The config
  // memo depends on the *deferred* term plus the individual non-search fields
  // (not the whole filterConfig object), so urgent keystroke renders keep the
  // previous identity and skip the filter work entirely.
  const deferredSearchTerm = useDeferredValue(filterConfig.searchTerm);
  const { category, showInStockOnly, showLowStockOnly, showOutOfStockOnly } =
    filterConfig;
  const deferredFilterConfig = useMemo(
    () => ({
      searchTerm: deferredSearchTerm,
      category,
      showInStockOnly,
      showLowStockOnly,
      showOutOfStockOnly,
    }),
    [
      deferredSearchTerm,
      category,
      showInStockOnly,
      showLowStockOnly,
      showOutOfStockOnly,
    ]
  );

  // Memoized filtering and sorting — re-computed only when their inputs change
  // instead of on every render (e.g. typing in the search field).
  const filteredProducts = useMemo(
    () => filterProducts(productList, deferredFilterConfig),
    [productList, deferredFilterConfig]
  );
  const visibleProducts = useMemo(
    () => sortProducts(filteredProducts, sortConfig),
    [filteredProducts, sortConfig]
  );

  const activeStockFilter: StockFilterType = getActiveStockFilter(filterConfig);

  const filtersActive = hasActiveFilters(filterConfig);

  return {
    productList,
    editingProduct,
    sortConfig,
    filterConfig,
    visibleProducts,
    totalProducts: productList.length,
    activeStockFilter,
    filtersActive,
    startEditing,
    handleCancelEdit,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleUndoDelete,
    handleImportProducts,
    handleUndoImport,
    handleResetData,
    handleSortChange,
    handleFilterChange,
    handleResetFilters,
    handleFilterByStock,
  };
};
