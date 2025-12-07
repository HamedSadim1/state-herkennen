import React, { useCallback } from "react";
import { SortConfig, SortField } from "../types/product";

interface SortControlsProps {
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

const SortControls: React.FC<SortControlsProps> = ({
  sortConfig,
  onSortChange,
}) => {
  const handleSortChange = useCallback(
    (field: SortField) => {
      const newDirection =
        sortConfig.field === field && sortConfig.direction === "asc"
          ? "desc"
          : "asc";

      onSortChange({
        field,
        direction: newDirection,
      });
    },
    [sortConfig, onSortChange]
  );

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Sort by:</span>
      <button
        onClick={() => handleSortChange("name")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
          sortConfig.field === "name"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Name {getSortIcon("name")}
      </button>
      <button
        onClick={() => handleSortChange("price")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
          sortConfig.field === "price"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Price {getSortIcon("price")}
      </button>
      <button
        onClick={() => handleSortChange("inStock")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
          sortConfig.field === "inStock"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Status {getSortIcon("inStock")}
      </button>
    </div>
  );
};

export default SortControls;
