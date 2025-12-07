import React, { useState, useCallback, useEffect } from "react";
import { Product } from "../types/product";
import { generateId } from "../utils/formatters";

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
  const [productName, setProductName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [inStock, setInStock] = useState<boolean>(false);

  // Update form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name);
      setPrice(editingProduct.price.toString());
      setInStock(editingProduct.inStock);
    } else {
      setProductName("");
      setPrice("");
      setInStock(false);
    }
  }, [editingProduct]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!productName.trim() || !price.trim()) return;

      const productData: Product = {
        id: editingProduct?.id || generateId(),
        name: productName.trim(),
        price: parseFloat(price),
        inStock,
      };

      if (editingProduct && onUpdateProduct) {
        onUpdateProduct(productData);
      } else {
        onAddProduct(productData);
      }

      if (!editingProduct) {
        setProductName("");
        setPrice("");
        setInStock(false);
      }
    },
    [productName, price, inStock, editingProduct, onAddProduct, onUpdateProduct]
  );

  const handleProductNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProductName(e.target.value);
    },
    []
  );

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPrice(e.target.value);
    },
    []
  );

  const handleInStockChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInStock(e.target.checked);
    },
    []
  );

  const handleCancel = useCallback(() => {
    if (onCancelEdit) {
      onCancelEdit();
    }
    setProductName("");
    setPrice("");
    setInStock(false);
  }, [onCancelEdit]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {editingProduct ? "Edit Product" : "Add New Product"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
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
              onChange={handleProductNameChange}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

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
              onChange={handlePriceChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="inStock"
            checked={inStock}
            onChange={handleInStockChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
            In Stock
          </label>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {editingProduct ? "Update Product" : "Add Product"}
          </button>

          {editingProduct && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
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
