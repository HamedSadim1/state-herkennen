import React, { useCallback, useRef } from "react";
import { Product } from "../types/product";
import AddProductForm from "./AddProductForm";
import ProductTable from "./ProductTable";
import SearchFilter from "./SearchFilter";
import StatsDashboard from "./StatsDashboard";
import { useInventory } from "../hooks/useInventory";
import { ChartBarIcon, PlusIcon, MagnifyingGlassIcon, CubeIcon } from "./icons";

interface TableProps {
  products: Product[];
}

const Table: React.FC<TableProps> = ({ products: initialProducts }) => {
  const {
    productList,
    editingProduct,
    sortConfig,
    filterConfig,
    visibleProducts,
    totalProducts,
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
  } = useInventory(initialProducts);

  // Scrolled into view when the user starts editing, so the form is never
  // silently updated off-screen.
  const formContainerRef = useRef<HTMLDivElement>(null);

  const handleEditProduct = useCallback(
    (product: Product) => {
      startEditing(product);
      formContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [startEditing]
  );

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
          products={visibleProducts}
          totalProducts={totalProducts}
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
