import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { Product } from "../types/product";
import { FALLBACK_CATEGORY } from "../config/constants";
import { parseCsvToProducts } from "../utils/csv";
import { pluralize } from "../utils/formatters";
import { useConfirm } from "../components/confirm-context";
import { useToast } from "../components/toast-context";

interface UseCsvImportOptions {
  /** Called with the parsed products after the user confirms the import. */
  onImportProducts: (products: Product[]) => void;
  /** Called from the "Undo" action on the success toast. */
  onUndoImport: () => void;
}

/**
 * Owns the whole CSV-import flow for a hidden file input: reading the file,
 * parsing, the replace-inventory confirmation, the success/undo toast and the
 * unknown-category warning toast, plus the importing/error UI state. Any
 * component with an "Import" button and a hidden file input can reuse it.
 */
export const useCsvImport = ({
  onImportProducts,
  onUndoImport,
}: UseCsvImportOptions) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const confirm = useConfirm();
  const { notify } = useToast();

  /** Opens the hidden file picker (wire this to the visible Import button). */
  const handleImportButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || isImporting) return;

      setIsImporting(true);
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
              `${importedProducts.length} ${pluralize(
                importedProducts.length,
                "product"
              )} imported.`,
              { label: "Undo", onClick: onUndoImport }
            );
            if (warnings.length > 0) {
              notify(
                "info",
                `${pluralize(warnings.length, "row")} had an unknown category and ${
                  warnings.length === 1 ? "was" : "were"
                } set to ${FALLBACK_CATEGORY}.`
              );
            }
          }
        } catch (error) {
          setImportError(
            error instanceof Error ? error.message : "Failed to import CSV."
          );
        } finally {
          setIsImporting(false);
        }
      };
      reader.onerror = () => {
        setImportError("Failed to read the file.");
        setIsImporting(false);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [onImportProducts, onUndoImport, confirm, notify, isImporting]
  );

  return {
    fileInputRef,
    importError,
    isImporting,
    handleImportButtonClick,
    handleImportFile,
  };
};
