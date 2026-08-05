import React from "react";
import { MagnifyingGlassIcon, ArrowPathIcon } from "./icons";

interface EmptyStateProps {
  /** True when search/category/stock filters are active. */
  filtersActive: boolean;
  onClearFilters: () => void;
}

/**
 * Shown when the table has no rows: explains why and offers the right next
 * step — clear the active filters, or add the first product via the form.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  filtersActive,
  onClearFilters,
}) => {
  return (
    <div className="text-center py-16">
      <div
        className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
        aria-hidden="true"
      >
        <MagnifyingGlassIcon className="w-7 h-7" />
      </div>
      {filtersActive ? (
        <>
          <p className="text-gray-600 text-lg font-medium">
            No products found.
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Try adjusting your search, category or filter criteria.
          </p>
          <button
            type="button"
            onClick={onClearFilters}
            className="btn btn-sm btn-soft-danger mt-4"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" /> Clear all filters
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-600 text-lg font-medium">No products yet.</p>
          <p className="text-gray-600 text-sm mt-1">
            Add your first product using the form above.
          </p>
        </>
      )}
    </div>
  );
};

export default EmptyState;
