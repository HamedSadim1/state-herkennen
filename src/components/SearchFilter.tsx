import React, { useCallback } from "react";
import { FilterConfig, Category } from "../types/product";
import { CATEGORIES } from "../model/data";

interface SearchFilterProps {
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  filterConfig,
  onFilterChange,
}) => {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilterChange({
        ...filterConfig,
        searchTerm: e.target.value,
      });
    },
    [filterConfig, onFilterChange]
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterChange({
        ...filterConfig,
        category: e.target.value as Category | "all",
      });
    },
    [filterConfig, onFilterChange]
  );

  const handleStockFilterChange = useCallback(
    (filterType: "inStock" | "outOfStock" | "all") => {
      onFilterChange({
        ...filterConfig,
        showInStockOnly: filterType === "inStock",
        showOutOfStockOnly: filterType === "outOfStock",
      });
    },
    [filterConfig, onFilterChange]
  );

  const stockButtonClassName = (active: boolean, activeVariant: string) =>
    `btn btn-md ${active ? activeVariant : "btn-ghost"}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Search & Filter</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="search" className="field-label">
            Search Products
          </label>
          <input
            type="text"
            id="search"
            value={filterConfig.searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by product name..."
            className="input"
          />
        </div>

        <div>
          <label htmlFor="filter-category" className="field-label">
            Category
          </label>
          <select
            id="filter-category"
            value={filterConfig.category}
            onChange={handleCategoryChange}
            className="input"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="field-label">Filter by Stock Status</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStockFilterChange("all")}
            aria-pressed={
              !filterConfig.showInStockOnly && !filterConfig.showOutOfStockOnly
            }
            className={stockButtonClassName(
              !filterConfig.showInStockOnly && !filterConfig.showOutOfStockOnly,
              "btn-neutral"
            )}
          >
            All Products
          </button>
          <button
            onClick={() => handleStockFilterChange("inStock")}
            aria-pressed={filterConfig.showInStockOnly}
            className={stockButtonClassName(
              filterConfig.showInStockOnly,
              "btn-success"
            )}
          >
            In Stock
          </button>
          <button
            onClick={() => handleStockFilterChange("outOfStock")}
            aria-pressed={filterConfig.showOutOfStockOnly}
            className={stockButtonClassName(
              filterConfig.showOutOfStockOnly,
              "btn-danger"
            )}
          >
            Out of Stock
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
