import React, { useCallback } from "react";
import { Product } from "../types/product";
import StatusBadge from "./StatusBadge";
import { formatPrice } from "../utils/formatters";
import { LOW_STOCK_THRESHOLD } from "../utils/productUtils";
import { useConfirm } from "./confirm-context";
import { useToast } from "./toast-context";
import { PencilIcon, TrashIcon } from "./icons";

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Smartphone: "chip-blue",
  Tablet: "chip-purple",
  Laptop: "chip-indigo",
  Audio: "chip-amber",
  Accessories: "chip-gray",
};

const ProductRow: React.FC<ProductRowProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const confirm = useConfirm();
  const { notify } = useToast();

  const handleEdit = useCallback(() => {
    onEdit(product);
  }, [product, onEdit]);

  const handleDelete = useCallback(async () => {
    const confirmed = await confirm({
      title: "Delete product?",
      message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (confirmed) {
      onDelete(product.id);
      notify("success", `"${product.name}" was deleted.`);
    }
  }, [product, confirm, notify, onDelete]);

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150 group">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <span className="block max-w-64 truncate" title={product.name}>
          {product.name}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span
          className={`chip ${
            CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.Accessories
          }`}
        >
          {product.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right tabular-nums">
        {formatPrice(product.price)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right tabular-nums">
        {product.quantity > 0 ? (
          <span>
            {product.quantity}
            {product.quantity <= LOW_STOCK_THRESHOLD && (
              <span className="ml-1 text-amber-700 text-xs font-medium">
                (low)
              </span>
            )}
          </span>
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge quantity={product.quantity} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="inline-flex items-center gap-2 pointer-fine:opacity-70 pointer-fine:group-hover:opacity-100 transition-opacity duration-150">
          <button onClick={handleEdit} className="btn btn-xs btn-soft-primary">
            <PencilIcon className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={handleDelete} className="btn btn-xs btn-soft-danger">
            <TrashIcon className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
