import type { FilterConfig, SortConfig, SortField } from "../types/product";

// ============================================================================
// Central constants file — every hardcoded value or magic number lives here so
// it can be changed in exactly one place. Grouped by domain.
// ============================================================================

// --- Categories -------------------------------------------------------------

/** The product categories; the `Category` type is derived from this list. */
export const CATEGORIES = [
  "Smartphone",
  "Tablet",
  "Laptop",
  "Audio",
  "Accessories",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Default category for the add/edit form (preserves the original default). */
export const DEFAULT_CATEGORY: Category = "Smartphone";

/** Category used when an import contains an unknown category value. */
export const FALLBACK_CATEGORY: Category = "Accessories";

// --- Stock levels -----------------------------------------------------------

/** Quantities at or below this are considered low stock. */
export const LOW_STOCK_THRESHOLD = 5;

// --- Persistence ------------------------------------------------------------

/** localStorage key under which the inventory is stored. */
export const STORAGE_KEY = "products";

// --- CSV import/export ------------------------------------------------------

/** Column order used for export and for header detection on import. */
export const CSV_HEADERS = [
  "id",
  "name",
  "category",
  "price",
  "quantity",
] as const;

/** Hard cap on imported rows so parsing stays responsive. */
export const MAX_CSV_ROWS = 10000;

/** File name used for exported CSVs. */
export const CSV_DOWNLOAD_FILENAME = "products-inventory.csv";

/** Accepted file types for the import file input. */
export const CSV_ACCEPT = ".csv,text/csv";

/** MIME type used when creating the exported CSV blob. */
export const CSV_MIME_TYPE = "text/csv;charset=utf-8;";

// --- Notifications ----------------------------------------------------------

/** How long a toast without an action stays visible (ms). */
export const TOAST_DURATION = 4000;

/** Toasts with an action (e.g. Undo) stay longer so the user can act (ms). */
export const TOAST_ACTION_DURATION = 8000;

/** Length of the exit animation before a toast is removed (ms). */
export const TOAST_EXIT_DURATION = 200;

// --- Confirm dialog ---------------------------------------------------------

/** Default labels for the confirm dialog. */
export const CONFIRM_DEFAULT_LABELS = {
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
} as const;

/** Default variant when none is specified. */
export const DEFAULT_CONFIRM_VARIANT = "danger" as const;

// --- Filters ----------------------------------------------------------------

/** The "no filters applied" state, shared by the inventory and filter panel. */
export const DEFAULT_FILTERS: FilterConfig = {
  searchTerm: "",
  category: "all",
  showInStockOnly: false,
  showLowStockOnly: false,
  showOutOfStockOnly: false,
};

// --- Sorting ----------------------------------------------------------------

/** Default sort order for the inventory table. */
export const DEFAULT_SORT: SortConfig = { field: "name", direction: "asc" };

/** Sortable columns, shared by the toolbar buttons and the table headers. */
export const SORT_FIELDS: {
  field: SortField;
  sortLabel: string;
  headerLabel: string;
}[] = [
  { field: "name", sortLabel: "Name", headerLabel: "Product Name" },
  { field: "category", sortLabel: "Category", headerLabel: "Category" },
  { field: "price", sortLabel: "Price", headerLabel: "Price" },
  { field: "quantity", sortLabel: "Quantity", headerLabel: "Quantity" },
];

// --- Formatting -------------------------------------------------------------

/** Locale used for price formatting. */
export const PRICE_LOCALE = "en-US";

/** Currency used for price formatting. */
export const PRICE_CURRENCY = "USD";

/** Rounding factor for prices: 100 = round to whole cents. */
export const PRICE_CENTS = 100;

/** Currency symbol (e.g. "$") derived from the locale/currency config, so the
    form label and the formatted prices can never disagree. */
export const CURRENCY_SYMBOL =
  new Intl.NumberFormat(PRICE_LOCALE, {
    style: "currency",
    currency: PRICE_CURRENCY,
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? "$";
