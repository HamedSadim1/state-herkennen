import React, { useRef, useCallback, useState } from "react";
import { Product, SortConfig } from "../types/product";
import ProductRow from "./ProductRow";
import SortControls from "./SortControls";
import { exportProductsToCsv, parseCsvToProducts } from "../utils/csv";

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

  const handleExport = useCallback(() => {
    exportProductsToCsv(products);
  }, [products]);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = parseCsvToProducts(String(reader.result));
          if (
            window.confirm(
              `Import ${parsed.length} products? This will replace the current inventory.`
            )
          ) {
            onImportProducts(parsed);
            setImportError(null);
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
    [onImportProducts]
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
              {products.length} {products.length === 1 ? "product" : "products"} shown
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SortControls sortConfig={sortConfig} onSortChange={onSortChange} />
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
            >
              ⬇️ Export CSV
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
            >
              ⬆️ Import CSV
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
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
            {importError}
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Product Name",
                "Category",
                "Price",
                "Quantity",
                "Status",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                    header === "Actions" ? "text-right" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
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
          <div className="text-4xl mb-3" aria-hidden="true">
            🔍
          </div>
          <p className="text-gray-600 text-lg font-medium">No products found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your search, category or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
