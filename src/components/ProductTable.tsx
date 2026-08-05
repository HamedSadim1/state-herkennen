import React, { useCallback } from "react";
import { Product, SortConfig, SortField } from "@/types/product";
import ProductRow from "./ProductRow";
import SortControls from "./SortControls";
import TableToolbar from "./TableToolbar";
import EmptyState from "./EmptyState";
import { exportProductsToCsv } from "@/utils/csv";
import { getNextSortConfig } from "@/utils/productUtils";
import { SORT_FIELDS } from "@/config/constants";
import { pluralize } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import { useToast } from "./toast-context";
import SortIndicator from "./SortIndicator";

const HEADERS: { label: string; field?: SortField }[] = [
  // Sortable columns come from the shared SORT_FIELDS config so the toolbar
  // buttons and the table headers can never drift apart.
  ...SORT_FIELDS.map(({ field, headerLabel }) => ({
    label: headerLabel,
    field,
  })),
  { label: "Status" },
  { label: "Actions" },
];

interface ProductTableProps {
  products: Product[];
  totalProducts: number;
  sortConfig: SortConfig;
  filtersActive: boolean;
  onClearFilters: () => void;
  onSortChange: (config: SortConfig) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onImportProducts: (products: Product[]) => void;
  onUndoImport: () => void;
  onResetData: () => void;
  onUndoDelete: (productId: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  totalProducts,
  sortConfig,
  filtersActive,
  onClearFilters,
  onSortChange,
  onEditProduct,
  onDeleteProduct,
  onImportProducts,
  onUndoImport,
  onResetData,
  onUndoDelete,
}) => {
  const { notify } = useToast();

  const handleExport = useCallback(() => {
    exportProductsToCsv(products);
    notify("info", "Inventory exported to CSV.");
  }, [products, notify]);

  const productNoun = pluralize(totalProducts, "product");

  const shownLabel =
    products.length === totalProducts
      ? `${totalProducts} ${productNoun} shown`
      : `Showing ${products.length} of ${totalProducts} ${productNoun}`;

  const titleBlock = (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Product Inventory</h2>
      <p aria-live="polite" className="text-sm text-gray-600 mt-0.5">
        {shownLabel}
      </p>
    </div>
  );

  return (
    <div className="card overflow-clip">
      <TableToolbar
        title={titleBlock}
        actions={
          <SortControls sortConfig={sortConfig} onSortChange={onSortChange} />
        }
        exportCount={products.length}
        onExport={handleExport}
        onImportProducts={onImportProducts}
        onUndoImport={onUndoImport}
        onResetData={onResetData}
      />

      <div className="overflow-x-auto overflow-y-clip">
        {/* border-separate overrides Tailwind's border-collapse: collapse, which
            makes Chrome paint a stray 1px black line on a random row whenever
            the rows are reordered (sorting) — the artifact moves between rows
            on every sort. Separate borders render independently, so no shared
            collapsed border can glitch. */}
        <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-0">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {HEADERS.map(({ label, field }) => {
                const isSorted = field != null && sortConfig.field === field;
                const isRightAligned =
                  label === "Actions" ||
                  field === "price" ||
                  field === "quantity";
                return (
                  <th
                    key={label}
                    scope="col"
                    aria-sort={
                      isSorted
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={cn(
                      "px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider",
                      isRightAligned ? "text-right" : "text-left"
                    )}
                  >
                    {field ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSortChange(getNextSortConfig(sortConfig, field))
                        }
                        aria-label={`Sort by ${label}${
                          isSorted
                            ? `, current sort ${
                                sortConfig.direction === "asc"
                                  ? "ascending"
                                  : "descending"
                              }`
                            : ""
                        }`}
                        className={cn(
                          "inline-flex items-center gap-1.5 w-full whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded",
                          isRightAligned ? "justify-end" : "justify-start"
                        )}
                      >
                        {label}
                        <span aria-hidden="true">
                          <SortIndicator
                            field={field}
                            sortConfig={sortConfig}
                          />
                        </span>
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                onUndoDelete={onUndoDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <EmptyState
          filtersActive={filtersActive}
          onClearFilters={onClearFilters}
        />
      )}
    </div>
  );
};

export default ProductTable;
