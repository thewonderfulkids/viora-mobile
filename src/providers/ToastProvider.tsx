import { createContext, ReactNode, useCallback, useMemo, useState } from "react";

import { ToastViewport } from "../components/common/ToastViewport";
import { ToastInput, ToastItem, ToastType } from "../types";

type ToastContextValue = {
  showToast: (type: ToastType, input: ToastInput) => void;
  success: (input: ToastInput) => void;
  error: (input: ToastInput) => void;
  info: (input: ToastInput) => void;
  warning: (input: ToastInput) => void;
  dismissToast: (id: string) => void;
};

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);

type ToastProviderProps = {
  children: ReactNode;
};

function createToastId() {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, input: ToastInput) => {
      const toast: ToastItem = {
        id: createToastId(),
        type,
        title: input.title,
        message: input.message,
        duration: input.duration ?? 3500,
      };

      setToasts((prev) => [toast, ...prev].slice(0, 3));

      setTimeout(() => {
        dismissToast(toast.id);
      }, toast.duration);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      success: (input: ToastInput) => showToast("success", input),
      error: (input: ToastInput) => showToast("error", input),
      info: (input: ToastInput) => showToast("info", input),
      warning: (input: ToastInput) => showToast("warning", input),
      dismissToast,
    }),
    [dismissToast, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}