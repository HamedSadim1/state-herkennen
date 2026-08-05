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
          aria-pressed={sortConfig.field === field}
          className={`btn btn-sm ${
            sortConfig.field === field ? "btn-primary" : "btn-ghost"
          }`}
        >
          {label} <span aria-hidden="true">{getSortIcon(field)}</span>
          {sortConfig.field === field && (
            <span className="sr-only">
              currently{" "}
              {sortConfig.direction === "asc" ? "ascending" : "descending"}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default SortControls;
