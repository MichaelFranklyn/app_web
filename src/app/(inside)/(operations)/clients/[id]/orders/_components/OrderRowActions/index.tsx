"use client";

import { RowActions, type RowAction } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";
import { DeleteOrderModal } from "../DeleteOrderModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  orderCode: string;
  /**
   * Editar é da PÁGINA: ela fecha o modal de pedidos e abre a edição no lugar
   * (dois modais empilhados confundiam qual se estava fechando).
   */
  onEdit: () => void;
  /** Ausente quando a situação do pedido não permite remover. */
  remove?: Omit<ComponentProps<typeof DeleteOrderModal>, Controlled>;
}

/** Editar e remover o pedido, no "⋯" (ver RowActions). */
export function OrderRowActions({ orderCode, onEdit, remove }: Props) {
  const [removeOpen, setRemoveOpen] = useState(false);

  const actions: RowAction[] = [
    { label: "Editar pedido", icon: Pencil, onClick: onEdit },
  ];
  if (remove) {
    actions.push({
      label: "Remover pedido",
      icon: Trash2,
      danger: true,
      onClick: () => setRemoveOpen(true),
    });
  }

  return (
    <RowActions label={`Ações do pedido ${orderCode}`} actions={actions}>
      {remove && (
        <DeleteOrderModal
          {...remove}
          open={removeOpen}
          onOpenChange={setRemoveOpen}
        />
      )}
    </RowActions>
  );
}
