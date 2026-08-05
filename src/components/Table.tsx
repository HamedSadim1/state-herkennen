import React, { useState, useCallback, useEffect, useRef } from "react";
import { Product, SortConfig, FilterConfig } from "../types/product";
import AddProductForm from "./AddProductForm";
import ProductTable from "./ProductTable";
import SearchFilter from "./SearchFilter";
import StatsDashboard from "./StatsDashboard";
import {
  sortProducts,
  filterProducts,
  saveProductsToStorage,
  loadProductsFromStorage,
} from "../utils/productUtils";

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

  // Save to localStorage whenever productList changes
  useEffect(() => {
    saveProductsToStorage(productList);
  }, [productList]);

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

  const handleDeleteProduct = useCallback((productId: string) => {
    setProductList((prev) =>
      prev.filter((product) => product.id !== productId)
    );
  }, []);

  const handleImportProducts = useCallback((importedProducts: Product[]) => {
    setProductList(importedProducts);
    // The imported inventory replaces the list, so an in-progress edit would
    // target a product that no longer exists.
    setEditingProduct(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingProduct(null);
  }, []);

  const handleSortChange = useCallback((config: SortConfig) => {
    setSortConfig(config);
  }, []);

  const handleFilterChange = useCallback((config: FilterConfig) => {
    setFilterConfig(config);
  }, []);

  // Apply filtering and sorting
  const filteredProducts = filterProducts(productList, filterConfig);
  const sortedAndFilteredProducts = sortProducts(filteredProducts, sortConfig);

  return (
    <div className="space-y-6">
      <StatsDashboard products={productList} />

      <div ref={formContainerRef} className="scroll-mt-6">
        <AddProductForm
          key={editingProduct?.id ?? "new-product"}
          onAddProduct={handleAddProduct}
          editingProduct={editingProduct}
          onUpdateProduct={handleUpdateProduct}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <SearchFilter
        filterConfig={filterConfig}
        onFilterChange={handleFilterChange}
      />

      <ProductTable
        products={sortedAndFilteredProducts}
        totalProducts={productList.length}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onImportProducts={handleImportProducts}
      />
    </div>
  );
};

export default Table;
