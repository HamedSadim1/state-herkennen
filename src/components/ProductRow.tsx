import React, { useCallback } from "react";
import { Product } from "../types/product";
import StatusBadge from "./StatusBadge";
import { formatPrice } from "../utils/formatters";

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const handleEdit = useCallback(() => {
    onEdit(product);
  }, [product, onEdit]);

  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      onDelete(product.id);
    }
  }, [product, onDelete]);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {product.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatPrice(product.price)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge inStock={product.inStock} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={handleEdit}
          className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-900 transition-colors duration-200"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default ProductRow;
