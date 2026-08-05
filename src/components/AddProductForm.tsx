import React, { useState, useCallback } from "react";
import { Product, Category } from "../types/product";
import { generateId } from "../utils/formatters";
import { CATEGORIES } from "../model/data";

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

  const resetForm = useCallback(() => {
    setProductName("");
    setPrice("");
    setQuantity("");
    setCategory("Smartphone");
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

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

      if (editingProduct && onUpdateProduct) {
        onUpdateProduct(productData);
      } else {
        onAddProduct(productData);
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
    ]
  );

  const handleCancel = useCallback(() => {
    onCancelEdit?.();
    resetForm();
  }, [onCancelEdit, resetForm]);

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {editingProduct ? "Edit Product" : "Add New Product"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Product Name
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={inputClassName}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
                className={inputClassName}
                required
              />
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
                className={inputClassName}
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <p
            className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-md active:scale-95"
          >
            {editingProduct ? "Update Product" : "Add Product"}
          </button>

          {editingProduct && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 active:scale-95"
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
