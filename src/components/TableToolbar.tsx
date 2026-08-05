import React, { useCallback } from "react";
import { Product } from "@/types/product";
import { CSV_ACCEPT } from "@/config/constants";
import { useCsvImport } from "@/hooks/useCsvImport";
import { useConfirm } from "./confirm-context";
import { useToast } from "./toast-context";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  SpinnerIcon,
  ArrowPathIcon,
} from "./icons";

interface TableToolbarProps {
  /** Heading block (title + result count) rendered on the left. */
  title: React.ReactNode;
  /** Sort controls (or any actions) rendered before the toolbar buttons. */
  actions?: React.ReactNode;
  /** Number of currently visible products, shown on the export button. */
  exportCount: number;
  onExport: () => void;
  onImportProducts: (products: Product[]) => void;
  onUndoImport: () => void;
  onResetData: () => void;
}

/**
 * Header strip of the inventory table. Owns the export/import/reset actions
 * including the hidden file input, the import loading state and the inline
 * import error, so the table component stays focused on rendering rows.
 */
const TableToolbar: React.FC<TableToolbarProps> = ({
  title,
  actions,
  exportCount,
  onExport,
  onImportProducts,
  onUndoImport,
  onResetData,
}) => {
  const confirm = useConfirm();
  const { notify } = useToast();

  const {
    fileInputRef,
    importError,
    isImporting,
    handleImportButtonClick,
    handleImportFile,
  } = useCsvImport({ onImportProducts, onUndoImport });

  const handleResetData = useCallback(async () => {
    const confirmed = await confirm({
      title: "Reset inventory?",
      message:
        "This replaces the current inventory with the original sample data. This action cannot be undone.",
      confirmLabel: "Reset",
      variant: "danger",
    });
    if (confirmed) {
      onResetData();
      notify("info", "Inventory reset to the original sample data.");
    }
  }, [confirm, onResetData, notify]);

  return (
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="flex flex-wrap justify-between items-center gap-4">
        {title}
        <div className="flex items-center gap-3">
          {actions}
          <button
            onClick={onExport}
            title="Exports the currently visible products"
            className="btn btn-sm btn-ghost"
          >
            <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV ({exportCount})
          </button>
          <button
            onClick={handleImportButtonClick}
            disabled={isImporting}
            className="btn btn-sm btn-ghost"
          >
            {isImporting ? (
              <>
                <SpinnerIcon className="w-4 h-4 animate-spin" /> Importing…
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-4 h-4" /> Import CSV
              </>
            )}
          </button>
          <button
            onClick={handleResetData}
            title="Restore the original sample data"
            className="btn btn-sm btn-soft-danger"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" /> Reset data
          </button>
          <label className="sr-only" htmlFor="csv-import">
            Import products from CSV
          </label>
          <input
            ref={fileInputRef}
            id="csv-import"
            type="file"
            accept={CSV_ACCEPT}
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
  );
};

export default TableToolbar;
