import React, { useState, useCallback, useEffect, useRef } from "react";
import { Product, SortConfig, FilterConfig } from "../types/product";
import AddProductForm from "./AddProductForm";
import ProductTable from "./ProductTable";
import SearchFilter from "./SearchFilter";
import StatsDashboard, { StockFilterType } from "./StatsDashboard";
import { useToast } from "./toast-context";
import { ChartBarIcon, PlusIcon, MagnifyingGlassIcon, CubeIcon } from "./icons";
import {
  sortProducts,
  filterProducts,
  saveProductsToStorage,
  loadProductsFromStorage,
} from "../utils/productUtils";

const DEFAULT_FILTERS: FilterConfig = {
  searchTerm: "",
  category: "all",
  showInStockOnly: false,
  showLowStockOnly: false,
  showOutOfStockOnly: false,
};

interface TableProps {
  products: Product[];
}

const Table: React.FC<TableProps> = ({ products: initialProducts }) => {
  const [productList, setProductList] = useState<Product[]>(() => {
    const stored = loadProductsFromStorage();
    return stored.length > 0
      ? stored
      : initialProducts.map((p) => ({
          ...p,
          id: Date.now().toString() + Math.random(),
        }));
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "name",
    direction: "asc",
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    searchTerm: "",
    category: "all",
    showInStockOnly: false,
    showLowStockOnly: false,
    showOutOfStockOnly: false,
  });

  // Scrolled into view when the user starts editing, so the form is never
  // silently updated off-screen.
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Last known-good list, kept so an import can be undone from its toast.
  const previousProductsRef = useRef<Product[]>([]);

  // Last deleted product (with its position), kept so a delete can be undone.
  const lastDeletedRef = useRef<{ product: Product; index: number } | null>(
    null
  );

  const { notify } = useToast();

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

  const handleAddProduct = useCallback((newProduct: Product) => {
    setProductList((prev) => [...prev, newProduct]);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    formContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
        lastDeletedRef.current = { product, index };
      }
      setProductList((prev) => prev.filter((p) => p.id !== productId));
      // Deleting a product that is currently being edited would leave the form
      // in a "ghost edit" (Update silently does nothing) — clear it.
      setEditingProduct((prev) => (prev?.id === productId ? null : prev));
    },
    [productList]
  );

  // Restores the last deleted product at (or near) its original position.
  const handleUndoDelete = useCallback(() => {
    const last = lastDeletedRef.current;
    if (!last) return;
    setProductList((prev) => {
      const at = Math.min(last.index, prev.length);
      return [...prev.slice(0, at), last.product, ...prev.slice(at)];
    });
    lastDeletedRef.current = null;
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
  }, []);

  // Restores the original sample data (mirrors the first-run seed behaviour).
  const handleResetData = useCallback(() => {
    setProductList(
      initialProducts.map((p) => ({
        ...p,
        id: Date.now().toString() + Math.random(),
      }))
    );
    setEditingProduct(null);
    // Clear both undo memories so a still-visible Undo toast can't restore
    // a list that the reset intentionally replaced.
    lastDeletedRef.current = null;
    previousProductsRef.current = [];
  }, [initialProducts]);

  const handleCancelEdit = useCallback(() => {
    setEditingProduct(null);
  }, []);

  const handleSortChange = useCallback((config: SortConfig) => {
    setSortConfig(config);
  }, []);

  const handleFilterChange = useCallback((config: FilterConfig) => {
    setFilterConfig(config);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilterConfig(DEFAULT_FILTERS);
  }, []);

  // Dashboard card -> filter shortcuts. "all" clears everything; the stock
  // cards toggle their own filter (clicking the active card turns it off).
  const handleFilterByStock = useCallback((type: StockFilterType) => {
    if (type === "all") {
      setFilterConfig(DEFAULT_FILTERS);
      return;
    }
    setFilterConfig((prev) => ({
      ...prev,
      showInStockOnly: type === "inStock" && !prev.showInStockOnly,
      showLowStockOnly: type === "lowStock" && !prev.showLowStockOnly,
      showOutOfStockOnly: type === "outOfStock" && !prev.showOutOfStockOnly,
    }));
  }, []);

  const activeStockFilter: StockFilterType = filterConfig.showLowStockOnly
    ? "lowStock"
    : filterConfig.showInStockOnly
      ? "inStock"
      : filterConfig.showOutOfStockOnly
        ? "outOfStock"
        : "all";

  const filtersActive =
    filterConfig.searchTerm !== "" ||
    filterConfig.category !== "all" ||
    filterConfig.showInStockOnly ||
    filterConfig.showLowStockOnly ||
    filterConfig.showOutOfStockOnly;

  // Apply filtering and sorting
  const filteredProducts = filterProducts(productList, filterConfig);
  const sortedAndFilteredProducts = sortProducts(filteredProducts, sortConfig);

  return (
    <div className="space-y-6">
      <nav
        aria-label="Page sections"
        className="flex flex-wrap justify-center gap-2"
      >
        <a href="#overview" className="btn btn-sm btn-ghost">
          <ChartBarIcon className="w-4 h-4" /> Overview
        </a>
        <a href="#add-product" className="btn btn-sm btn-ghost">
          <PlusIcon className="w-4 h-4" /> Add Product
        </a>
        <a href="#filters" className="btn btn-sm btn-ghost">
          <MagnifyingGlassIcon className="w-4 h-4" /> Filters
        </a>
        <a href="#inventory" className="btn btn-sm btn-ghost">
          <CubeIcon className="w-4 h-4" /> Inventory
        </a>
      </nav>

      <section id="overview" className="scroll-mt-6">
        <StatsDashboard
          products={productList}
          activeStockFilter={activeStockFilter}
          hasAnyFilter={filtersActive}
          onFilterByStock={handleFilterByStock}
        />
      </section>

      <div id="add-product" ref={formContainerRef} className="scroll-mt-6">
        <AddProductForm
          key={editingProduct?.id ?? "new-product"}
          onAddProduct={handleAddProduct}
          editingProduct={editingProduct}
          onUpdateProduct={handleUpdateProduct}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <section id="filters" className="scroll-mt-6">
        <SearchFilter
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
        />
      </section>

      <section id="inventory" className="scroll-mt-6">
        <ProductTable
          products={sortedAndFilteredProducts}
          totalProducts={productList.length}
          sortConfig={sortConfig}
          filtersActive={filtersActive}
          onClearFilters={handleResetFilters}
          onSortChange={handleSortChange}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onImportProducts={handleImportProducts}
          onUndoImport={handleUndoImport}
          onResetData={handleResetData}
          onUndoDelete={handleUndoDelete}
        />
      </section>
    </div>
  );
};

export default Table;
