"use client";

import { Button } from "@/components/Button";

interface Props {
  itemCount: number;
  isLoading: boolean;
  onSubmit: () => void;
  /** Volta para a tela de origem (perguntando antes, se houver itens). */
  onCancel: () => void;
}

export function NewOrderFooter({
  itemCount,
  isLoading,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-8">
      <Button.Root
        type="button"
        appearance="ghost"
        color="neutral"
        size="md"
        noUppercase
        disabled={isLoading}
        onClick={onCancel}
      >
        <Button.Title>Cancelar</Button.Title>
      </Button.Root>
      <Button.Root
        type="button"
        appearance="solid"
        color="amber"
        size="md"
        noUppercase
        loading={isLoading}
        onClick={onSubmit}
      >
        <Button.Title>
          {itemCount > 0
            ? `Criar pedido com ${itemCount} ${itemCount === 1 ? "item" : "itens"}`
            : "Criar pedido"}
        </Button.Title>
      </Button.Root>
    </div>
  );
}
