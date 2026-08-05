import React, { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircleIcon, XCircleIcon, InfoIcon, XMarkIcon } from "./icons";
import { ToastContext, ToastType, ToastAction } from "./toast-context";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  action?: ToastAction;
}

const TOAST_DURATION = 4000;
// Toasts with an action (e.g. Undo) stay longer so the user has time to act.
const TOAST_ACTION_DURATION = 8000;
const EXIT_DURATION = 200;

const TOAST_STYLES: Record<
  ToastType,
  { accent: string; icon: React.ReactNode }
> = {
  success: {
    accent: "border-l-emerald-500",
    icon: <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />,
  },
  error: {
    accent: "border-l-red-500",
    icon: <XCircleIcon className="w-5 h-5 text-red-600 shrink-0" />,
  },
  info: {
    accent: "border-l-blue-500",
    icon: <InfoIcon className="w-5 h-5 text-blue-600 shrink-0" />,
  },
};

const ToastCard: React.FC<{
  toast: ToastItem;
  onClose: () => void;
}> = ({ toast, onClose }) => {
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);

  const duration = toast.action ? TOAST_ACTION_DURATION : TOAST_DURATION;

  // Auto-dismiss: start the exit animation just before the toast expires.
  useEffect(() => {
    const timer = window.setTimeout(
      () => setExiting(true),
      duration - EXIT_DURATION
    );
    return () => window.clearTimeout(timer);
  }, [duration]);

  // Wait for the exit animation before actually removing the toast.
  useEffect(() => {
    if (exiting) {
      exitTimerRef.current = window.setTimeout(onClose, EXIT_DURATION);
    }
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, [exiting, onClose]);

  const style = TOAST_STYLES[toast.type];

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-gray-100 border-l-4 bg-white p-4 shadow-lg shadow-gray-200/60 ${
        style.accent
      } ${exiting ? "animate-toast-out" : "animate-toast-in"}`}
    >
      {style.icon}
      <p className="flex-1 text-sm font-medium text-gray-800 pt-0.5">
        {toast.message}
      </p>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            setExiting(true);
          }}
          className="btn btn-xs btn-soft-primary whitespace-nowrap"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => setExiting(true)}
        aria-label="Dismiss notification"
        className="btn btn-xs btn-ghost h-8 w-8 shrink-0 rounded-lg text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (type: ToastType, message: string, action?: ToastAction) => {
      const id = nextIdRef.current++;
      setToasts((prev) => [...prev, { id, type, message, action }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
