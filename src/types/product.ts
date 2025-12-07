export interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

export interface ProductFormData {
  name: string;
  price: string;
  inStock: boolean;
}

export type SortField = "name" | "price" | "inStock";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  searchTerm: string;
  showInStockOnly: boolean;
  showOutOfStockOnly: boolean;
}
