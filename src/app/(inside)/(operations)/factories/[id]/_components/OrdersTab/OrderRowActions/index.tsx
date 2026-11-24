"use client";

import { RowActions, type RowAction } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";
import { EditOrderModal } from "../../../../../_components/EditOrderModal";
import { DeleteOrderModal } from "../DeleteOrderModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  orderCode: string;
  edit: Omit<ComponentProps<typeof EditOrderModal>, Controlled>;
  /** Ausente quando a situação do pedido não permite remover. */
  remove?: Omit<ComponentProps<typeof DeleteOrderModal>, Controlled>;
}

/** Editar e remover o pedido, no "⋯" (ver RowActions). */
export function OrderRowActions({ orderCode, edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  // Sem `remove` (situação que não permite), o item não entra no "⋯".
  const actions: RowAction[] = [
    { label: "Editar pedido", icon: Pencil, onClick: () => setEditOpen(true) },
    {
      label: "Remover pedido",
      icon: Trash2,
      danger: true,
      absent: !remove,
      onClick: () => setRemoveOpen(true),
    },
  ];

  return (
    <RowActions label={`Ações do pedido ${orderCode}`} actions={actions}>
      <EditOrderModal {...edit} open={editOpen} onOpenChange={setEditOpen} />
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
