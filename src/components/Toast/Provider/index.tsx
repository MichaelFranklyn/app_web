"use client";

import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, ReactNode, useCallback, useState } from "react";
import { Title } from "@/components/Title";
import { ToastContextData, ToastProps } from "./interface";
import { toastStyles } from "./style";

const variantIcons = {
  info: <Info size={14} className="text-(--blue)" />,
  success: <CheckCircle2 size={14} className="text-(--green)" />,
  warning: <AlertCircle size={14} className="text-(--amber)" />,
  error: <XCircle size={14} className="text-(--red)" />,
};

export const ToastContext = createContext<ToastContextData>(
  {} as ToastContextData
);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      variant = "info",
      duration = 4000,
    }: Omit<ToastProps, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { id, title, description, variant, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}

      <div className={toastStyles.container} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={toastStyles.item}>
            <div className="mt-[2px] shrink-0">
              {variantIcons[t.variant || "info"]}
            </div>

            <div className={toastStyles.content}>
              <Title variant="body-sm" weight="medium" className={toastStyles.title}>
                {t.title}
              </Title>
              {t.description && (
                <Title variant="body-xs" color="muted" className={toastStyles.description}>
                  {t.description}
                </Title>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className={toastStyles.close}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
