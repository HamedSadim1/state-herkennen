import React, { useState, useCallback } from "react";
import { Product, Category } from "../types/product";
import { generateId } from "../utils/formatters";
import { CATEGORIES } from "../model/data";
import { useToast } from "./toast-context";
import { PlusIcon } from "./icons";

interface AddProductFormProps {
  onAddProduct: (product: Product) => void;
  editingProduct?: Product | null;
  onUpdateProduct?: (product: Product) => void;
  onCancelEdit?: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  onAddProduct,
  editingProduct,
  onUpdateProduct,
  onCancelEdit,
}) => {
  const [productName, setProductName] = useState<string>(
    editingProduct?.name ?? ""
  );
  const [price, setPrice] = useState<string>(
    editingProduct ? editingProduct.price.toString() : ""
  );
  const [quantity, setQuantity] = useState<string>(
    editingProduct ? editingProduct.quantity.toString() : ""
  );
  const [category, setCategory] = useState<Category>(
    editingProduct?.category ?? "Smartphone"
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notify } = useToast();

  const resetForm = useCallback(() => {
    setProductName("");
    setPrice("");
    setQuantity("");
    setCategory("Smartphone");
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isSubmitting) return;

      const trimmedName = productName.trim();
      const parsedPrice = parseFloat(price);
      const parsedQuantity = parseInt(quantity, 10);

      if (!trimmedName) {
        setError("Product name is required.");
        return;
      }
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        setError("Enter a valid price of 0 or more.");
        return;
      }
      if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
        setError("Enter a valid quantity of 0 or more.");
        return;
      }

      const productData: Product = {
        id: editingProduct?.id || generateId(),
        name: trimmedName,
        price: parsedPrice,
        quantity: parsedQuantity,
        category,
      };

      // Briefly lock the button so a rapid double click can't add the same
      // product twice; the lock releases on the next tick.
      setIsSubmitting(true);
      window.setTimeout(() => setIsSubmitting(false), 0);

      if (editingProduct && onUpdateProduct) {
        onUpdateProduct(productData);
        notify("success", `"${trimmedName}" was updated.`);
      } else {
        onAddProduct(productData);
        notify("success", `"${trimmedName}" was added to the inventory.`);
      }

      if (!editingProduct) {
        resetForm();
      }
    },
    [
      productName,
      price,
      quantity,
      category,
      editingProduct,
      onAddProduct,
      onUpdateProduct,
      resetForm,
      notify,
      isSubmitting,
    ]
  );

  const handleCancel = useCallback(() => {
    onCancelEdit?.();
    resetForm();
  }, [onCancelEdit, resetForm]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {editingProduct ? "Edit Product" : "Add New Product"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label htmlFor="productName" className="field-label">
              Product Name
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="product-category" className="field-label">
              Category
            </label>
            <select
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="input"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="field-label">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="quantity" className="field-label">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="input"
              required
            />
          </div>
        </div>

        {error && (
          <p className="alert-error" role="alert">
            {error}
          </p>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
          >
            <PlusIcon className="w-4 h-4" />
            {editingProduct ? "Update Product" : "Add Product"}
          </button>

          {editingProduct && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost btn-lg"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
