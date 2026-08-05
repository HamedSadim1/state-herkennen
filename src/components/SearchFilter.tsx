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

  const stockButtonClassName = (active: boolean, activeColor: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
      active
        ? `${activeColor} text-white shadow-sm`
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Search & Filter
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search Products
          </label>
          <input
            type="text"
            id="search"
            value={filterConfig.searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by product name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            value={filterConfig.category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Stock Status
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStockFilterChange("all")}
            className={stockButtonClassName(
              !filterConfig.showInStockOnly && !filterConfig.showOutOfStockOnly,
              "bg-gray-800"
            )}
          >
            All Products
          </button>
          <button
            onClick={() => handleStockFilterChange("inStock")}
            className={stockButtonClassName(
              filterConfig.showInStockOnly,
              "bg-emerald-600"
            )}
          >
            In Stock
          </button>
          <button
            onClick={() => handleStockFilterChange("outOfStock")}
            className={stockButtonClassName(
              filterConfig.showOutOfStockOnly,
              "bg-red-600"
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
