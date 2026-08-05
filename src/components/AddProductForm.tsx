import React, { useState, useCallback } from "react";
import {
  Product,
  Category,
  CATEGORIES,
  DEFAULT_CATEGORY,
} from "../types/product";
import { generateId } from "../utils/formatters";
import {
  validateProductInput,
  ProductInputErrors,
} from "../utils/productUtils";
import { useToast } from "./toast-context";
import { PlusIcon } from "./icons";

interface AddProductFormProps {
  onAddProduct: (product: Product) => void;
  editingProduct?: Product | null;
  onUpdateProduct?: (product: Product) => void;
  onCancelEdit?: () => void;
}

// The form's error state is exactly what the shared validator returns.
type FieldErrors = ProductInputErrors;

// Renders a per-field validation message, wired to the field via its error id
// (referenced by the input's aria-describedby). Renders nothing when valid.
const FieldError: React.FC<{ id: string; message?: string }> = ({
  id,
  message,
}) =>
  message ? (
    <p id={id} className="field-error" role="alert">
      {message}
    </p>
  ) : null;

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
    editingProduct?.category ?? DEFAULT_CATEGORY
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notify } = useToast();

  const clearFieldError = useCallback((field: keyof FieldErrors) => {
    setFieldErrors((prev) =>
      prev[field] ? { ...prev, [field]: undefined } : prev
    );
  }, []);

  const resetForm = useCallback(() => {
    setProductName("");
    setPrice("");
    setQuantity("");
    setCategory(DEFAULT_CATEGORY);
    setFieldErrors({});
  }, []);

  const handleSubmit = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (isSubmitting) return;

      const trimmedName = productName.trim();

      const errors = validateProductInput({
        name: productName,
        price,
        quantity,
      });
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setFieldErrors({});

      // Round to cents so the stored value matches the displayed value.
      const parsedPrice = Math.round(Number(price) * 100) / 100;
      const parsedQuantity = Number(quantity);

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
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {editingProduct ? "Edit Product" : "Add New Product"}
      </h2>
      {/* noValidate: custom validation below drives the UX (red rings + per-field
          messages) instead of being shadowed by native browser tooltips. */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label htmlFor="productName" className="field-label">
              Product Name
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                clearFieldError("name");
              }}
              placeholder="Enter product name"
              className={`input ${fieldErrors.name ? "input-error" : ""}`}
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={
                fieldErrors.name ? "productName-error" : undefined
              }
            />
            <FieldError id="productName-error" message={fieldErrors.name} />
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
              onChange={(e) => {
                setPrice(e.target.value);
                clearFieldError("price");
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`input ${fieldErrors.price ? "input-error" : ""}`}
              aria-invalid={fieldErrors.price ? true : undefined}
              aria-describedby={fieldErrors.price ? "price-error" : undefined}
            />
            <FieldError id="price-error" message={fieldErrors.price} />
          </div>

          <div>
            <label htmlFor="quantity" className="field-label">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                clearFieldError("quantity");
              }}
              placeholder="0"
              min="0"
              step="1"
              className={`input ${fieldErrors.quantity ? "input-error" : ""}`}
              aria-invalid={fieldErrors.quantity ? true : undefined}
              aria-describedby={
                fieldErrors.quantity ? "quantity-error" : undefined
              }
            />
            <FieldError id="quantity-error" message={fieldErrors.quantity} />
          </div>
        </div>

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
