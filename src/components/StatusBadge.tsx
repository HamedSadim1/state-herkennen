import React from "react";
import { getStockStatus, LOW_STOCK_THRESHOLD } from "../utils/productUtils";

interface StatusBadgeProps {
  quantity: number;
}

const STOCK_BADGE_STYLES = {
  inStock: {
    label: "In Stock",
    className: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  lowStock: {
    label: `Low Stock (≤${LOW_STOCK_THRESHOLD})`,
    className: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  outOfStock: {
    label: "Out of Stock",
    className: "bg-red-100 text-red-800",
    dot: "bg-red-500",
  },
} as const;

const StatusBadge: React.FC<StatusBadgeProps> = ({ quantity }) => {
  const status = getStockStatus(quantity);
  const style = STOCK_BADGE_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${style.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
        aria-hidden="true"
      />
      {style.label}
    </span>
  );
};

export default StatusBadge;
