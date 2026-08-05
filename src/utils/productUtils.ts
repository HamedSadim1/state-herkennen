import {
  Product,
  SortConfig,
  FilterConfig,
  StockStatus,
  StockFilterType,
} from "@/types/product";
import { LOW_STOCK_THRESHOLD, STORAGE_KEY } from "@/config/constants";

// --- Filter-state helpers (single source of truth for the panels) ---

export const hasAnyStockFilter = (config: FilterConfig): boolean =>
  config.showInStockOnly ||
  config.showLowStockOnly ||
  config.showOutOfStockOnly;

export const hasActiveFilters = (config: FilterConfig): boolean =>
  config.searchTerm !== "" ||
  config.category !== "all" ||
  hasAnyStockFilter(config);

export const getActiveStockFilter = (config: FilterConfig): StockFilterType => {
  if (config.showLowStockOnly) return "lowStock";
  if (config.showInStockOnly) return "inStock";
  if (config.showOutOfStockOnly) return "outOfStock";
  return "all";
};

export const getStockStatus = (quantity: number): StockStatus => {
  if (quantity <= 0) return "outOfStock";
  if (quantity <= LOW_STOCK_THRESHOLD) return "lowStock";
  return "inStock";
};

// Returns the sort config that results from clicking a sortable field:
// toggles direction when the field is already active, otherwise sorts asc.
export const getNextSortConfig = (
  current: SortConfig,
  field: SortConfig["field"]
): SortConfig => {
  const direction =
    current.field === field && current.direction === "asc" ? "desc" : "asc";
  return { field, direction };
};

export const sortProducts = (
  products: Product[],
  sortConfig: SortConfig
): Product[] => {
  return [...products].sort((a, b) => {
    const directionMultiplier = sortConfig.direction === "asc" ? 1 : -1;

    switch (sortConfig.field) {
      case "name":
        return a.name.localeCompare(b.name) * directionMultiplier;
      case "category":
        return a.category.localeCompare(b.category) * directionMultiplier;
      case "price":
        return (a.price - b.price) * directionMultiplier;
      case "quantity":
        return (a.quantity - b.quantity) * directionMultiplier;
      default:
        return 0;
    }
  });
};

export const filterProducts = (
  products: Product[],
  filterConfig: FilterConfig
): Product[] => {
  return products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(filterConfig.searchTerm.toLowerCase());

    const matchesCategory =
      filterConfig.category === "all" ||
      product.category === filterConfig.category;

    // Stock filters mirror the dashboard semantics exactly (see getStockStatus),
    // so "In Stock" means truly in stock and low-stock products can be filtered
    // on their own instead of being lumped in with in-stock items.
    const noStockFilter = !hasAnyStockFilter(filterConfig);
    const stockStatus = getStockStatus(product.quantity);
    const matchesStockFilter =
      noStockFilter ||
      (filterConfig.showInStockOnly && stockStatus === "inStock") ||
      (filterConfig.showLowStockOnly && stockStatus === "lowStock") ||
      (filterConfig.showOutOfStockOnly && stockStatus === "outOfStock");

    return matchesSearch && matchesCategory && matchesStockFilter;
  });
};

// Validates the raw form field strings and returns per-field error messages.
// An empty object means the input is valid. Kept as a pure function so the
// form logic is testable without rendering.
export interface ProductInputErrors {
  name?: string;
  price?: string;
  quantity?: string;
}

export const validateProductInput = (input: {
  name: string;
  price: string;
  quantity: string;
}): ProductInputErrors => {
  const errors: ProductInputErrors = {};

  if (input.name.trim() === "") {
    errors.name = "Product name is required.";
  }

  // Empty string must be rejected explicitly: Number("") === 0 would
  // otherwise silently accept a blank price.
  const trimmedPrice = input.price.trim();
  const parsedPrice = Number(trimmedPrice);
  if (trimmedPrice === "" || Number.isNaN(parsedPrice) || parsedPrice < 0) {
    errors.price = "Enter a valid price of 0 or more.";
  }

  // Strict digits-only check: Number() silently accepts "", decimals (5.5),
  // hex (0x10) and scientific notation (1e2), which would store wrong data.
  if (!/^\d+$/.test(input.quantity.trim())) {
    errors.quantity = "Enter a whole quantity of 0 or more.";
  }

  return errors;
};

// Returns false when the write failed (e.g. storage quota exceeded) so the UI
// can surface the problem instead of silently losing changes.
export const saveProductsToStorage = (products: Product[]): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (error) {
    console.error("Failed to save products to localStorage:", error);
    return false;
  }
};

// Minimal per-item shape check used to filter out corrupt rows instead of
// discarding the user's whole stored inventory.
const isValidProduct = (product: unknown): product is Product => {
  return (
    product !== null &&
    typeof product === "object" &&
    typeof (product as Product).name === "string" &&
    (product as Product).name.trim().length > 0 &&
    typeof (product as Product).price === "number" &&
    typeof (product as Product).quantity === "number" &&
    typeof (product as Product).category === "string"
  );
};

export interface LoadProductsResult {
  products: Product[];
  /** True when stored data was unreadable or contained invalid rows. */
  hadCorruptData: boolean;
}

export const loadProductsFromStorage = (): LoadProductsResult => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { products: [], hadCorruptData: false };

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return { products: [], hadCorruptData: true };
    }

    // Keep the valid rows and drop the rest: one corrupt entry shouldn't wipe
    // the entire inventory. The flag lets the UI warn about what happened.
    const products = parsed.filter(isValidProduct);
    return { products, hadCorruptData: products.length !== parsed.length };
  } catch (error) {
    console.error("Failed to load products from localStorage:", error);
    return { products: [], hadCorruptData: true };
  }
};
