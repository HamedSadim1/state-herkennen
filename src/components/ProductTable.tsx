import React, { useRef, useCallback, useState } from "react";
import { Product, SortConfig, SortField } from "../types/product";
import ProductRow from "./ProductRow";
import SortControls from "./SortControls";
import { exportProductsToCsv, parseCsvToProducts } from "../utils/csv";
import { getNextSortConfig } from "../utils/productUtils";
import { useConfirm } from "./confirm-context";
import { useToast } from "./toast-context";
import SortIndicator from "./SortIndicator";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
} from "./icons";

const HEADERS: { label: string; field?: SortField }[] = [
  { label: "Product Name", field: "name" },
  { label: "Category", field: "category" },
  { label: "Price", field: "price" },
  { label: "Quantity", field: "quantity" },
  { label: "Status" },
  { label: "Actions" },
];

interface ProductTableProps {
  products: Product[];
  totalProducts: number;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onImportProducts: (products: Product[]) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  totalProducts,
  sortConfig,
  onSortChange,
  onEditProduct,
  onDeleteProduct,
  onImportProducts,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const confirm = useConfirm();
  const { notify } = useToast();

  const handleExport = useCallback(() => {
    exportProductsToCsv(products);
    notify("info", "Inventory exported to CSV.");
  }, [products, notify]);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

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
              `${importedProducts.length} ${
                importedProducts.length === 1 ? "product" : "products"
              } imported.`
            );
            if (warnings.length > 0) {
              notify(
                "info",
                `${warnings.length} ${
                  warnings.length === 1 ? "row had" : "rows had"
                } an unknown category and ${
                  warnings.length === 1 ? "was" : "were"
                } set to Accessories.`
              );
            }
          }
        } catch (error) {
          setImportError(
            error instanceof Error ? error.message : "Failed to import CSV."
          );
        }
      };
      reader.onerror = () => {
        setImportError("Failed to read the file.");
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [onImportProducts, confirm, notify]
  );
  const productNoun = totalProducts === 1 ? "product" : "products";

  const shownLabel =
    products.length === totalProducts
      ? `${totalProducts} ${productNoun} shown`
      : `Showing ${products.length} of ${totalProducts} ${productNoun}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-clip">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Product Inventory
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">{shownLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <SortControls sortConfig={sortConfig} onSortChange={onSortChange} />
            <button onClick={handleExport} className="btn btn-sm btn-ghost">
              <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm btn-ghost"
            >
              <ArrowUpTrayIcon className="w-4 h-4" /> Import CSV
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
          <p className="text-gray-600 text-lg font-medium">
            No products found.
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Try adjusting your search, category or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
