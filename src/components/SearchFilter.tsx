import React, { useCallback } from "react";
import { FilterConfig, StockFilterType } from "../types/product";
import {
  CATEGORIES,
  DEFAULT_FILTERS,
  type Category,
} from "../config/constants";
import { hasActiveFilters, hasAnyStockFilter } from "../utils/productUtils";
import { MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon } from "./icons";

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

  const clearSearch = useCallback(() => {
    onFilterChange({
      ...filterConfig,
      searchTerm: "",
    });
  }, [filterConfig, onFilterChange]);

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
    (filterType: Exclude<StockFilterType, "all">) => {
      onFilterChange({
        ...filterConfig,
        showInStockOnly: filterType === "inStock",
        showLowStockOnly: filterType === "lowStock",
        showOutOfStockOnly: filterType === "outOfStock",
      });
    },
    [filterConfig, onFilterChange]
  );

  const handleReset = useCallback(() => {
    onFilterChange(DEFAULT_FILTERS);
  }, [onFilterChange]);

  const stockButtonClassName = (active: boolean, activeVariant: string) =>
    `btn btn-md ${active ? activeVariant : "btn-ghost"}`;

  const activeFilterCount =
    (filterConfig.searchTerm !== "" ? 1 : 0) +
    (filterConfig.category !== "all" ? 1 : 0) +
    (hasAnyStockFilter(filterConfig) ? 1 : 0);

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
        {hasActiveFilters(filterConfig) && (
          <div className="flex items-center gap-2">
            <span className="chip chip-blue">
              {activeFilterCount}{" "}
              {activeFilterCount === 1 ? "filter" : "filters"} active
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-sm btn-soft-danger"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" /> Reset filters
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="search" className="field-label">
            Search Products
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="search"
              value={filterConfig.searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by product name..."
              className="input pl-9 pr-9"
            />
            {filterConfig.searchTerm !== "" && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
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

      <fieldset className="mt-4">
        <legend className="field-label">Filter by Stock Status</legend>
        <div className="flex flex-wrap gap-2">
          {/* Matches the dashboard's "Total Products" card: clears every
              filter (search, category and stock) in one action. */}
          <button
            onClick={() => onFilterChange(DEFAULT_FILTERS)}
            aria-pressed={!hasActiveFilters(filterConfig)}
            className={stockButtonClassName(
              !hasActiveFilters(filterConfig),
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
            onClick={() => handleStockFilterChange("lowStock")}
            aria-pressed={filterConfig.showLowStockOnly}
            className={stockButtonClassName(
              filterConfig.showLowStockOnly,
              "btn-warning"
            )}
          >
            Low Stock
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
      </fieldset>
    </div>
  );
};

export default SearchFilter;
