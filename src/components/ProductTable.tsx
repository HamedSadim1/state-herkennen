import React, { useRef, useCallback, useState } from "react";
import { Product, SortConfig, SortField } from "../types/product";
import ProductRow from "./ProductRow";
import SortControls from "./SortControls";
import { exportProductsToCsv, parseCsvToProducts } from "../utils/csv";
import { useConfirm } from "./confirm-context";
import { useToast } from "./toast-context";
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
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onImportProducts: (products: Product[]) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
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
          const parsed = parseCsvToProducts(String(reader.result));
          const confirmed = await confirm({
            title: "Replace inventory?",
            message: `Import ${parsed.length} products? This will replace the current inventory.`,
            confirmLabel: "Import",
            variant: "primary",
          });
          if (confirmed) {
            onImportProducts(parsed);
            setImportError(null);
            notify(
              "success",
              `${parsed.length} ${parsed.length === 1 ? "product" : "products"} imported.`
            );
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Product Inventory
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {products.length} {products.length === 1 ? "product" : "products"}{" "}
              shown
            </p>
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {HEADERS.map(({ label, field }) => {
                const isSorted = field != null && sortConfig.field === field;
                return (
                  <th
                    key={label}
                    aria-sort={
                      isSorted
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={`px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                      label === "Actions" ||
                      field === "price" ||
                      field === "quantity"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {label}
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
          <p className="text-gray-500 text-sm mt-1">
            Try adjusting your search, category or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
