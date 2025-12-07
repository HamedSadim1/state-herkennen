import React, { useCallback } from "react";
import { FilterConfig } from "../types/product";

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

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Search & Filter
      </h3>

      <div className="space-y-4">
        {/* Search Input */}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Stock Filter Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Stock Status
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleStockFilterChange("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                !filterConfig.showInStockOnly &&
                !filterConfig.showOutOfStockOnly
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => handleStockFilterChange("inStock")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filterConfig.showInStockOnly
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => handleStockFilterChange("outOfStock")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filterConfig.showOutOfStockOnly
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
