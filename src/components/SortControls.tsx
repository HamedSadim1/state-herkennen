import React, { useCallback } from "react";
import { SortConfig, SortField } from "@/types/product";
import { getNextSortConfig } from "@/utils/productUtils";
import { SORT_FIELDS } from "@/config/constants";
import { cn } from "@/utils/cn";
import SortIndicator from "./SortIndicator";
import { ChevronUpIcon, ChevronDownIcon } from "./icons";

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
      onSortChange(getNextSortConfig(sortConfig, field));
    },
    [sortConfig, onSortChange]
  );

  return (
    <>
      {/* Desktop: one button per sortable field. */}
      <div className="hidden md:flex items-center flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-600">Sort by:</span>
        {SORT_FIELDS.map(({ field, sortLabel }) => (
          <button
            key={field}
            onClick={() => handleSortChange(field)}
            aria-pressed={sortConfig.field === field}
            className={cn(
              "btn btn-sm",
              sortConfig.field === field ? "btn-primary" : "btn-ghost"
            )}
          >
            {sortLabel}{" "}
            <span aria-hidden="true">
              <SortIndicator field={field} sortConfig={sortConfig} />
            </span>
            {sortConfig.field === field && (
              <span className="sr-only">
                currently{" "}
                {sortConfig.direction === "asc" ? "ascending" : "descending"}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile: compact field select + direction toggle so the toolbar
          doesn't wrap into several rows on small screens. */}
      <div className="flex md:hidden items-center gap-2">
        <label className="sr-only" htmlFor="sort-field">
          Sort by
        </label>
        <select
          id="sort-field"
          value={sortConfig.field}
          onChange={(e) => handleSortChange(e.target.value as SortField)}
          className="input w-auto py-1.5"
        >
          {SORT_FIELDS.map(({ field, sortLabel }) => (
            <option key={field} value={field}>
              {sortLabel}
            </option>
          ))}
        </select>{" "}
        {/* Selecting the already-active field toggles the direction. */}
        <button
          type="button"
          onClick={() => handleSortChange(sortConfig.field)}
          aria-label={`Sort direction: ${
            sortConfig.direction === "asc" ? "ascending" : "descending"
          }`}
          className="btn btn-sm btn-ghost px-2.5"
        >
          {sortConfig.direction === "asc" ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  );
};

export default SortControls;
