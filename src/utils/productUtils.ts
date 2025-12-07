import { Product, SortConfig, FilterConfig } from "../types/product";

export const sortProducts = (
  products: Product[],
  sortConfig: SortConfig
): Product[] => {
  return [...products].sort((a, b) => {
    let aValue: any = a[sortConfig.field];
    let bValue: any = b[sortConfig.field];

    if (sortConfig.field === "name") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
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
    const matchesStockFilter =
      (!filterConfig.showInStockOnly && !filterConfig.showOutOfStockOnly) ||
      (filterConfig.showInStockOnly && product.inStock) ||
      (filterConfig.showOutOfStockOnly && !product.inStock);

    return matchesSearch && matchesStockFilter;
  });
};

export const saveProductsToStorage = (products: Product[]): void => {
  try {
    localStorage.setItem("products", JSON.stringify(products));
  } catch (error) {
    console.error("Failed to save products to localStorage:", error);
  }
};

export const loadProductsFromStorage = (): Product[] => {
  try {
    const stored = localStorage.getItem("products");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load products from localStorage:", error);
    return [];
  }
};
