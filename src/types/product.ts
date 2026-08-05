// The category list and the `Category` type derived from it live in
// config/constants (single source of truth); only the type is imported here.
import type { Category } from "@/config/constants";

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
