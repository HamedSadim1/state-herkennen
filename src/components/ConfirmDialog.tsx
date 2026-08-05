import React, { useCallback, useEffect, useRef, useState } from "react";
import { TrashIcon, ExclamationTriangleIcon } from "./icons";
import { ConfirmContext, ConfirmOptions } from "./confirm-context";

const DEFAULT_OPTIONS = {
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: "danger",
};

interface ConfirmDialogProps {
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  options,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!options) return;

    // Remember what had focus so we can restore it when the dialog closes.
    previouslyFocusedRef.current = document.activeElement;

    // Focus the safest action: Cancel for destructive dialogs, Confirm for
    // non-destructive ones (e.g. import) so Enter doesn't destroy data.
    const { variant } = { ...DEFAULT_OPTIONS, ...options };
    if (variant === "danger") {
      cancelButtonRef.current?.focus();
    } else {
      confirmButtonRef.current?.focus();
    }

    // Lock body scroll while the dialog is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      // Simple focus trap: keep Tab cycling through the dialog's buttons so
      // keyboard users can't tab into the page behind the overlay.
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      const previous = previouslyFocusedRef.current;
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus();
      }
    };
    // `onCancel` comes from a stable useCallback, so this only re-runs when the
    // dialog opens or closes (options changes).
  }, [options, onCancel]);

  if (!options) return null;

  const { title, message, confirmLabel, cancelLabel, variant } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-modal-in"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
              isDanger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
            }`}
            aria-hidden="true"
          >
            {isDanger ? (
              <TrashIcon className="w-5 h-5" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <h2
              id="confirm-dialog-title"
              className="text-lg font-bold text-gray-900"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-message"
              className="mt-1.5 text-sm text-gray-600"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            ref={cancelButtonRef}
            onClick={onCancel}
            className="btn btn-md btn-ghost"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`btn btn-md ${isDanger ? "btn-danger" : "btn-primary"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  // Stable handlers so the dialog's effect only ever reacts to `options`.
  const handleConfirm = useCallback(() => handleClose(true), [handleClose]);
  const handleCancel = useCallback(() => handleClose(false), [handleClose]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        options={options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};
