export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

export type ToastInput = {
  title: string;
  message?: string;
  duration?: number;
};