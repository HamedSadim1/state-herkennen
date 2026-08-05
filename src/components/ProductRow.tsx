import React, { useCallback } from "react";
import { Product } from "../types/product";
import StatusBadge from "./StatusBadge";
import { formatPrice } from "../utils/formatters";
import { LOW_STOCK_THRESHOLD } from "../utils/productUtils";

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Smartphone: "bg-blue-50 text-blue-700 border-blue-200",
  Tablet: "bg-purple-50 text-purple-700 border-purple-200",
  Laptop: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Audio: "bg-amber-50 text-amber-700 border-amber-200",
  Accessories: "bg-gray-50 text-gray-700 border-gray-200",
};

const ProductRow: React.FC<ProductRowProps> = ({ product, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => {
    onEdit(product);
  }, [product, onEdit]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      onDelete(product.id);
    }
  }, [product, onDelete]);

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150 group">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {product.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${
            CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.Accessories
          }`}
        >
          {product.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatPrice(product.price)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {product.quantity > 0 ? (
          <span>
            {product.quantity}
            {product.quantity <= LOW_STOCK_THRESHOLD && (
              <span className="ml-1 text-amber-600 text-xs font-medium">
                (low)
              </span>
            )}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge quantity={product.quantity} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="inline-flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={handleEdit}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-150"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
