// Single source of truth for the product categories: the runtime list drives
// the type, so adding a category only touches this one place.
export const CATEGORIES = [
  "Smartphone",
  "Tablet",
  "Laptop",
  "Audio",
  "Accessories",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Default category for the add/edit form (kept as Smartphone to preserve the
// existing behaviour) and fallback for imports with unknown values — two
// distinct defaults, so they stay separate constants.
export const DEFAULT_CATEGORY: Category = "Smartphone";
export const FALLBACK_CATEGORY: Category = "Accessories";

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: Category;
}

export type SortField = "name" | "category" | "price" | "quantity";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  searchTerm: string;
  category: Category | "all";
  showInStockOnly: boolean;
  showLowStockOnly: boolean;
  showOutOfStockOnly: boolean;
}

export type StockStatus = "inStock" | "lowStock" | "outOfStock";

// Stock-scope for the dashboard shortcut cards and the filter panel; kept in
// one place so both UIs can never drift apart.
export type StockFilterType = "all" | "inStock" | "lowStock" | "outOfStock";
