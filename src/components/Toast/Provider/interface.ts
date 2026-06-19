export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastContextData {
  toasts: ToastProps[];
  toast: (props: Omit<ToastProps, "id">) => void;
  removeToast: (id: string) => void;
}
