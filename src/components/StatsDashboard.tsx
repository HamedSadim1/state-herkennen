import React, { useMemo } from "react";
import { Product } from "../types/product";
import { getStockStatus } from "../utils/productUtils";
import { formatPrice } from "../utils/formatters";
import {
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  BanknotesIcon,
} from "./icons";

export type StockFilterType = "all" | "inStock" | "lowStock" | "outOfStock";

interface StatsDashboardProps {
  products: Product[];
  /** Which stock filter is currently active in the filter panel. */
  activeStockFilter: StockFilterType;
  /** True when any filter (search, category or stock) is active. */
  hasAnyFilter: boolean;
  onFilterByStock: (type: StockFilterType) => void;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
  alignEnd?: boolean;
  onClick?: () => void;
  active?: boolean;
  activeRing?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accent,
  iconBg,
  alignEnd = false,
  onClick,
  active = false,
  activeRing = "",
  className = "",
}) => {
  const content = (
    <>
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className={`min-w-0 ${alignEnd ? "sm:text-right" : ""}`}>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
          {label}
        </p>
        <p className={`text-2xl font-bold tabular-nums ${accent} truncate`}>
          {value}
        </p>
      </div>
    </>
  );

  const baseClass = `bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${className} ${
    alignEnd ? "sm:justify-between" : ""
  }`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`${baseClass} w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          active ? `ring-2 ring-offset-2 ${activeRing}` : ""
        }`}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClass}>{content}</div>;
};

const StatsDashboard: React.FC<StatsDashboardProps> = ({
  products,
  activeStockFilter,
  hasAnyFilter,
  onFilterByStock,
}) => {
  // Single pass over the products computes the inventory value and all three
  // stock counts together; memoized so it only re-runs when the list changes.
  const { totalValue, inStockCount, lowStockCount, outOfStockCount } =
    useMemo(() => {
      let totalValue = 0;
      let inStockCount = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;
      for (const product of products) {
        totalValue += product.price * product.quantity;
        const status = getStockStatus(product.quantity);
        if (status === "inStock") inStockCount += 1;
        else if (status === "lowStock") lowStockCount += 1;
        else outOfStockCount += 1;
      }
      return { totalValue, inStockCount, lowStockCount, outOfStockCount };
    }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Visually hidden heading so the dashboard appears in the heading
          outline (h2) alongside the other page sections. */}
      <h2 className="sr-only">Overview</h2>
      <StatCard
        label="Total Products"
        value={String(products.length)}
        icon={<CubeIcon className="w-6 h-6 text-blue-600" />}
        accent="text-gray-900"
        iconBg="bg-blue-100"
        onClick={() => onFilterByStock("all")}
        active={activeStockFilter === "all" && !hasAnyFilter}
        activeRing="ring-blue-200"
      />
      <StatCard
        label="In Stock"
        value={String(inStockCount)}
        icon={<CheckCircleIcon className="w-6 h-6 text-emerald-600" />}
        accent="text-emerald-600"
        iconBg="bg-emerald-100"
        onClick={() => onFilterByStock("inStock")}
        active={activeStockFilter === "inStock"}
        activeRing="ring-emerald-200"
      />
      <StatCard
        label="Low Stock"
        value={String(lowStockCount)}
        icon={<ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />}
        accent="text-amber-700"
        iconBg="bg-amber-100"
        onClick={() => onFilterByStock("lowStock")}
        active={activeStockFilter === "lowStock"}
        activeRing="ring-amber-200"
      />
      <StatCard
        label="Out of Stock"
        value={String(outOfStockCount)}
        icon={<XCircleIcon className="w-6 h-6 text-red-600" />}
        accent="text-red-600"
        iconBg="bg-red-100"
        onClick={() => onFilterByStock("outOfStock")}
        active={activeStockFilter === "outOfStock"}
        activeRing="ring-red-200"
      />
      {/* Span the full grid width at sm+ so the 5th card becomes a
          summary banner instead of leaving empty grid cells. */}
      <StatCard
        label="Inventory Value"
        value={formatPrice(totalValue)}
        icon={<BanknotesIcon className="w-6 h-6 text-indigo-600" />}
        accent="text-indigo-600"
        iconBg="bg-indigo-100"
        alignEnd
        className="sm:col-span-2 lg:col-span-full"
      />
    </div>
  );
};

export default StatsDashboard;
