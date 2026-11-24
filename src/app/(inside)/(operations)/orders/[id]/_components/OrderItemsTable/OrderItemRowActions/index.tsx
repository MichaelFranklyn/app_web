"use client";

import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";
import { DeleteOrderItemModal } from "../DeleteOrderItemModal";
import { EditOrderItemModal } from "../EditOrderItemModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  edit: Omit<ComponentProps<typeof EditOrderItemModal>, Controlled>;
  remove: Omit<ComponentProps<typeof DeleteOrderItemModal>, Controlled>;
}

/** Editar e remover o item, no "⋯" (ver RowActions). */
export function OrderItemRowActions({ edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <RowActions
      label={`Ações do item ${edit.item.product?.name ?? ""}`.trim()}
      actions={[
        {
          label: "Editar item",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Remover item",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      <EditOrderItemModal
        {...edit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteOrderItemModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
