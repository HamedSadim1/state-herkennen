import React from "react";
import { Product } from "../types/product";
import { getStockStatus } from "../utils/productUtils";
import { formatPrice } from "../utils/formatters";

interface StatsDashboardProps {
  products: Product[];
}

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  accent: string;
  iconBg: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accent,
  iconBg,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${className}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${iconBg}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className={`text-2xl font-bold tabular-nums ${accent} truncate`}>
          {value}
        </p>
      </div>
    </div>
  );
};

const StatsDashboard: React.FC<StatsDashboardProps> = ({ products }) => {
  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );

  const inStockCount = products.filter(
    (product) => getStockStatus(product.quantity) === "inStock"
  ).length;

  const lowStockCount = products.filter(
    (product) => getStockStatus(product.quantity) === "lowStock"
  ).length;

  const outOfStockCount = products.filter(
    (product) => getStockStatus(product.quantity) === "outOfStock"
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Products"
        value={String(products.length)}
        icon="📦"
        accent="text-gray-900"
        iconBg="bg-blue-100"
      />
      <StatCard
        label="In Stock"
        value={String(inStockCount)}
        icon="✅"
        accent="text-emerald-600"
        iconBg="bg-emerald-100"
      />
      <StatCard
        label="Low Stock"
        value={String(lowStockCount)}
        icon="⚠️"
        accent="text-amber-700"
        iconBg="bg-amber-100"
      />
      <StatCard
        label="Out of Stock"
        value={String(outOfStockCount)}
        icon="🚫"
        accent="text-red-600"
        iconBg="bg-red-100"
      />
      {/* Span the full grid width at sm+ so the 5th card becomes a
          summary banner instead of leaving empty grid cells. */}
      <StatCard
        label="Inventory Value"
        value={formatPrice(totalValue)}
        icon="💰"
        accent="text-indigo-600"
        iconBg="bg-indigo-100"
        className="sm:col-span-2 lg:col-span-full sm:justify-between"
      />
    </div>
  );
};

export default StatsDashboard;
