import React, { useCallback } from "react";
import { FilterConfig, Category } from "../types/product";
import { CATEGORIES } from "../model/data";
import { MagnifyingGlassIcon, XMarkIcon, ArrowPathIcon } from "./icons";

interface SearchFilterProps {
  filterConfig: FilterConfig;
  onFilterChange: (config: FilterConfig) => void;
}

const DEFAULT_FILTERS: FilterConfig = {
  searchTerm: "",
  category: "all",
  showInStockOnly: false,
  showOutOfStockOnly: false,
};

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
    (filterType: "inStock" | "outOfStock" | "all") => {
      onFilterChange({
        ...filterConfig,
        showInStockOnly: filterType === "inStock",
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

  const hasActiveFilters =
    filterConfig.searchTerm !== "" ||
    filterConfig.category !== "all" ||
    filterConfig.showInStockOnly ||
    filterConfig.showOutOfStockOnly;

  const activeFilterCount =
    (filterConfig.searchTerm !== "" ? 1 : 0) +
    (filterConfig.category !== "all" ? 1 : 0) +
    (filterConfig.showInStockOnly || filterConfig.showOutOfStockOnly ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-gray-900">Search & Filter</h3>
        {hasActiveFilters && (
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
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
