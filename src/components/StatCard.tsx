import React from "react";
import { cn } from "@/utils/cn";

export interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
  /** Right-align the text block on sm+ (used for the full-width banner). */
  alignEnd?: boolean;
  /** When provided, the card renders as a button (filter shortcut). */
  onClick?: () => void;
  active?: boolean;
  activeRing?: string;
  className?: string;
}

/**
 * Summary card used by the stats dashboard: an icon, a label and a value.
 * Pass an `onClick` to make it a filter shortcut (rendered as a button with
 * `aria-pressed` and an active ring); without it, it renders as a plain card.
 */
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
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconBg
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className={cn("min-w-0", alignEnd && "sm:text-right")}>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
          {label}
        </p>
        <p
          className={cn("text-2xl font-bold tabular-nums", accent, "truncate")}
        >
          {value}
        </p>
      </div>
    </>
  );

  const baseClass = cn(
    "card p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
    className,
    alignEnd && "sm:justify-between"
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          baseClass,
          "w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          active && ["ring-2 ring-offset-2", activeRing]
        )}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClass}>{content}</div>;
};

export default StatCard;
