"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, ReactNode, useCallback, useRef, useState } from "react";
import { ToastContextData, ToastProps } from "./interface";
import { toastStyles } from "./style";
import { ICON_SIZE } from "@/components/Icon";

// Aviso é a cor de ALERTA, não o âmbar (âmbar é só interação). A cor vai no
// círculo do ícone (currentColor) e na faixa lateral do aviso.
const variants = {
  info: { icon: Info, tone: "text-(--color-status-info)" },
  success: { icon: CheckCircle2, tone: "text-(--color-status-success)" },
  warning: { icon: AlertCircle, tone: "text-(--color-status-warning)" },
  error: { icon: XCircle, tone: "text-(--color-status-danger)" },
};

/** Tempo da animação de saída (`--animate-toast-out`) antes de desmontar. */
const EXIT_MS = 160;

type ShownToast = ToastProps & { leaving?: boolean };

export const ToastContext = createContext<ToastContextData>(
  {} as ToastContextData
);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ShownToast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const removeToast = useCallback((id: string) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    // Marca a saída e só tira da lista depois da animação. Por tempo, e não
    // por `animationend`: no jsdom (testes) o evento não dispara.
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      EXIT_MS
    );
  }, []);

  const schedule = useCallback(
    (id: string, duration: number) => {
      if (duration <= 0) return;
      timers.current.set(
        id,
        setTimeout(() => removeToast(id), duration)
      );
    },
    [removeToast]
  );

  const toast = useCallback(
    ({
      title,
      description,
      variant = "info",
      duration = 4000,
    }: Omit<ToastProps, "id">) => {
      const id = Math.random().toString(36).slice(2, 11);
      setToasts((prev) => [
        ...prev,
        { id, title, description, variant, duration },
      ]);
      schedule(id, duration);
    },
    [schedule]
  );

  // Ponteiro em cima = lendo: o aviso espera. Quem lê devagar não perde a
  // mensagem no meio. Ao sair, o prazo recomeça inteiro.
  const pause = (id: string) => clearTimeout(timers.current.get(id));
  const resume = (t: ShownToast) => {
    if (!t.leaving) schedule(t.id, t.duration ?? 4000);
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}

      <div className={toastStyles.container} aria-live="polite">
        {toasts.map((t) => {
          const { icon: Icon, tone } = variants[t.variant || "info"];
          return (
            <div
              key={t.id}
              className={toastStyles.item}
              data-leaving={t.leaving || undefined}
              onMouseEnter={() => pause(t.id)}
              onMouseLeave={() => resume(t)}
            >
              <span className={cn(toastStyles.icon, tone)}>
                <Icon size={ICON_SIZE.md} aria-hidden />
              </span>

              <div className={toastStyles.content}>
                <Title variant="body-sm" weight="semibold">
                  {t.title}
                </Title>
                {t.description && (
                  <Title
                    variant="body-xs"
                    color="muted"
                    className={toastStyles.description}
                  >
                    {t.description}
                  </Title>
                )}
              </div>

              <Button.Root
                appearance="ghost"
                color="neutral"
                size="sm"
                isIconOnly
                label="Fechar aviso"
                className={toastStyles.close}
                onClick={() => removeToast(t.id)}
              >
                <Button.Icon icon={X} />
              </Button.Root>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
