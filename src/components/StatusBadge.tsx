import React from "react";
import { getStockStatus } from "../utils/productUtils";
import { LOW_STOCK_THRESHOLD } from "../config/constants";

interface StatusBadgeProps {
  quantity: number;
}

const STOCK_BADGE_STYLES = {
  inStock: {
    label: "In Stock",
    className: "chip-success",
    dot: "bg-emerald-500",
  },
  lowStock: {
    label: `Low Stock (≤${LOW_STOCK_THRESHOLD})`,
    className: "chip-warning",
    dot: "bg-amber-500",
  },
  outOfStock: {
    label: "Out of Stock",
    className: "chip-danger",
    dot: "bg-red-500",
  },
} as const;

const StatusBadge: React.FC<StatusBadgeProps> = ({ quantity }) => {
  const status = getStockStatus(quantity);
  const style = STOCK_BADGE_STYLES[status];

  return (
    <span className={`chip ${style.className}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
        aria-hidden="true"
      />
      {style.label}
    </span>
  );
};

export default StatusBadge;
