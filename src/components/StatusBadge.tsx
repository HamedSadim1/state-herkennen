import React from "react";

interface StatusBadgeProps {
  inStock: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ inStock }) => {
  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {inStock ? "In Stock" : "Out of Stock"}
    </span>
  );
};

export default StatusBadge;
