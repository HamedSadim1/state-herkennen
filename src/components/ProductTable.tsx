import React, { useRef, useCallback, useState } from "react";
import { Product, SortConfig, SortField } from "../types/product";
import ProductRow from "./ProductRow";
import SortControls from "./SortControls";
import { exportProductsToCsv, parseCsvToProducts } from "../utils/csv";
import { getNextSortConfig, SORT_FIELDS } from "../utils/productUtils";
import { pluralize } from "../utils/formatters";
import { useConfirm } from "./confirm-context";
import { useToast } from "./toast-context";
import SortIndicator from "./SortIndicator";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  SpinnerIcon,
  ArrowPathIcon,
} from "./icons";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const confirm = useConfirm();
  const { notify } = useToast();

  const handleExport = useCallback(() => {
    exportProductsToCsv(products);
    notify("info", "Inventory exported to CSV.");
  }, [products, notify]);

  const handleResetData = useCallback(async () => {
    const confirmed = await confirm({
      title: "Reset inventory?",
      message:
        "This replaces the current inventory with the original sample data. This action cannot be undone.",
      confirmLabel: "Reset",
      variant: "danger",
    });
    if (confirmed) {
      onResetData();
      notify("info", "Inventory reset to the original sample data.");
    }
  }, [confirm, onResetData, notify]);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || isImporting) return;

      setIsImporting(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const { products: importedProducts, warnings } = parseCsvToProducts(
            String(reader.result)
          );
          const confirmed = await confirm({
            title: "Replace inventory?",
            message: `Import ${importedProducts.length} products? This will replace the current inventory.`,
            confirmLabel: "Import",
            variant: "primary",
          });
          if (confirmed) {
            onImportProducts(importedProducts);
            setImportError(null);
            notify(
              "success",
              `${importedProducts.length} ${pluralize(
                importedProducts.length,
                "product"
              )} imported.`,
              { label: "Undo", onClick: onUndoImport }
            );
            if (warnings.length > 0) {
              notify(
                "info",
                `${pluralize(warnings.length, "row")} had an unknown category and ${
                  warnings.length === 1 ? "was" : "were"
                } set to Accessories.`
              );
            }
          }
        } catch (error) {
          setImportError(
            error instanceof Error ? error.message : "Failed to import CSV."
          );
        } finally {
          setIsImporting(false);
        }
      };
      reader.onerror = () => {
        setImportError("Failed to read the file.");
        setIsImporting(false);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [onImportProducts, onUndoImport, confirm, notify, isImporting]
  );
  const productNoun = pluralize(totalProducts, "product");

  const shownLabel =
    products.length === totalProducts
      ? `${totalProducts} ${productNoun} shown`
      : `Showing ${products.length} of ${totalProducts} ${productNoun}`;

  return (
    <div className="card overflow-clip">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Product Inventory
            </h2>
            <p aria-live="polite" className="text-sm text-gray-600 mt-0.5">
              {shownLabel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SortControls sortConfig={sortConfig} onSortChange={onSortChange} />
            <button
              onClick={handleExport}
              title="Exports the currently visible products"
              className="btn btn-sm btn-ghost"
            >
              <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV (
              {products.length})
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="btn btn-sm btn-ghost"
            >
              {isImporting ? (
                <>
                  <SpinnerIcon className="w-4 h-4 animate-spin" /> Importing…
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-4 h-4" /> Import CSV
                </>
              )}
            </button>
            <button
              onClick={handleResetData}
              title="Restore the original sample data"
              className="btn btn-sm btn-soft-danger"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" /> Reset data
            </button>
            <label className="sr-only" htmlFor="csv-import">
              Import products from CSV
            </label>
            <input
              ref={fileInputRef}
              id="csv-import"
              type="file"
              accept=".csv,text/csv"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>
        {importError && (
          <p className="alert-error mt-3" role="alert">
            {importError}
          </p>
        )}
      </div>

      <div className="overflow-x-auto overflow-y-clip">
        <table className="min-w-full divide-y divide-gray-200">
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
                    className={`px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                      isRightAligned ? "text-right" : "text-left"
                    }`}
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
                        className={`inline-flex items-center gap-1.5 w-full whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${
                          isRightAligned ? "justify-end" : "justify-start"
                        }`}
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
        <div className="text-center py-16">
          <div
            className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
            aria-hidden="true"
          >
            <MagnifyingGlassIcon className="w-7 h-7" />
          </div>
          {filtersActive ? (
            <>
              <p className="text-gray-600 text-lg font-medium">
                No products found.
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Try adjusting your search, category or filter criteria.
              </p>
              <button
                type="button"
                onClick={onClearFilters}
                className="btn btn-sm btn-soft-danger mt-4"
              >
                <ArrowPathIcon className="w-3.5 h-3.5" /> Clear all filters
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-lg font-medium">
                No products yet.
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Add your first product using the form above.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductTable;
