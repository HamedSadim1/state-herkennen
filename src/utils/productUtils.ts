import { Product, SortConfig, FilterConfig, StockStatus } from "../types/product";

export const LOW_STOCK_THRESHOLD = 5;

export const getStockStatus = (quantity: number): StockStatus => {
  if (quantity <= 0) return "outOfStock";
  if (quantity <= LOW_STOCK_THRESHOLD) return "lowStock";
  return "inStock";
};

export const isInStock = (product: Product): boolean => product.quantity > 0;

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

    const matchesStockFilter =
      (!filterConfig.showInStockOnly && !filterConfig.showOutOfStockOnly) ||
      (filterConfig.showInStockOnly && isInStock(product)) ||
      (filterConfig.showOutOfStockOnly && !isInStock(product));

    return matchesSearch && matchesCategory && matchesStockFilter;
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
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    // Validate the stored data matches the current Product shape. If it was
    // saved by an older version of the app (e.g. no quantity/category), fall
    // back to the seed data instead of rendering broken values.
    const isValidShape = parsed.every(
      (product) =>
        product !== null &&
        typeof product === "object" &&
        typeof (product as Product).quantity === "number" &&
        typeof (product as Product).category === "string"
    );

    return isValidShape ? (parsed as Product[]) : [];
  } catch (error) {
    console.error("Failed to load products from localStorage:", error);
    return [];
  }
};
