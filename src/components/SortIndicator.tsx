import React from "react";
import { SortConfig, SortField } from "../types/product";
import { ArrowsUpDownIcon, ChevronUpIcon, ChevronDownIcon } from "./icons";

interface SortIndicatorProps {
  field: SortField;
  sortConfig: SortConfig;
}

// Shared sort-state icon so the sort buttons and the sortable table headers
// always render the same indicator.
const SortIndicator: React.FC<SortIndicatorProps> = ({ field, sortConfig }) => {
  if (sortConfig.field !== field) {
    return <ArrowsUpDownIcon className="w-3.5 h-3.5 text-gray-400" />;
  }
  return sortConfig.direction === "asc" ? (
    <ChevronUpIcon className="w-3.5 h-3.5" />
  ) : (
    <ChevronDownIcon className="w-3.5 h-3.5" />
  );
};

export default SortIndicator;
