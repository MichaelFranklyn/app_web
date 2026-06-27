"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useState, type ComponentProps, type ReactNode } from "react";

interface ConfirmModalProps {
  /** Controlado: passe `open` + `onOpenChange`. Se omitido, usa estado interno. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Gatilho para uso não-controlado — renderizado dentro de `Modal.Trigger`. */
  trigger?: ReactNode;

  title: string;
  description?: string;
  size?: ComponentProps<typeof Modal.Content>["size"];

  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: ComponentProps<typeof Button.Root>["color"];

  /** Ação assíncrona. Deve LANÇAR em caso de erro (mostra toast e mantém aberto). */
  onConfirm: () => Promise<void>;
  successMessage?: string;
  /** Disparado de forma síncrona ANTES da ação (ex.: remoção otimista imediata). */
  onBeforeConfirm?: () => void;
  /** Após sucesso (commit otimista, navegação, refetch). */
  onSuccess?: () => void;
  /** Em caso de erro (rollback otimista). */
  onError?: () => void;
  /** Fecha ao concluir com sucesso (default `true`). */
  closeOnSuccess?: boolean;
}

/**
 * Modal de confirmação genérico (deletar, revogar, etc.). Encapsula o shell do
 * Modal + footer Cancelar/confirmar + loading e toast via `useAsyncAction`.
 * O que varia por caso (otimista, navegação, refetch) fica nos callbacks
 * `onBeforeConfirm` / `onSuccess` / `onError`.
 */
export function ConfirmModal({
  open: openProp,
  onOpenChange,
  trigger,
  title,
  description,
  size = "md",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmColor = "red",
  onConfirm,
  successMessage,
  onBeforeConfirm,
  onSuccess,
  onError,
  closeOnSuccess = true,
}: ConfirmModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = (value: boolean) => {
    onOpenChange?.(value);
    if (!isControlled) setInternalOpen(value);
  };

  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = () => {
    onBeforeConfirm?.();
    execute(onConfirm, {
      successMessage,
      onSuccess: () => {
        onSuccess?.();
        if (closeOnSuccess) setOpen(false);
      },
      onError: () => onError?.(),
    });
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      {trigger && <Modal.Trigger asChild>{trigger}</Modal.Trigger>}

      <Modal.Content size={size}>
        <Modal.Header title={title} description={description} />
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>{cancelLabel}</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color={confirmColor}
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>{confirmLabel}</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
