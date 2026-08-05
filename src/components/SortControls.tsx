import React, { useCallback } from "react";
import { SortConfig, SortField } from "../types/product";

interface SortControlsProps {
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

const SORT_FIELDS: { field: SortField; label: string }[] = [
  { field: "name", label: "Name" },
  { field: "category", label: "Category" },
  { field: "price", label: "Price" },
  { field: "quantity", label: "Quantity" },
];

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
    if (sortConfig.field !== field) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="flex items-center flex-wrap gap-2">
      <span className="text-sm font-medium text-gray-500">Sort by:</span>
      {SORT_FIELDS.map(({ field, label }) => (
        <button
          key={field}
          onClick={() => handleSortChange(field)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
            sortConfig.field === field
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {label} <span aria-hidden="true">{getSortIcon(field)}</span>
        </button>
      ))}
    </div>
  );
};

export default SortControls;
