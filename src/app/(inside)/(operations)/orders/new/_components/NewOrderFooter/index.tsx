"use client";

import { Button } from "@/components/Button";
import { plural } from "@/utils/format/plural";

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
        loading={isLoading}
        onClick={onSubmit}
      >
        <Button.Title>
          {itemCount > 0
            ? `Criar pedido com ${plural(itemCount, "item", "itens")}`
            : "Criar pedido"}
        </Button.Title>
      </Button.Root>
    </div>
  );
}
