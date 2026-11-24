"use client";

import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";
import { EditPaymentTermModal } from "../EditPaymentTermModal";
import { RemovePaymentTermModal } from "../RemovePaymentTermModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  edit: Omit<ComponentProps<typeof EditPaymentTermModal>, Controlled>;
  remove: Omit<ComponentProps<typeof RemovePaymentTermModal>, Controlled>;
}

/** Editar e remover, no "⋯" (ver RowActions). */
export function PaymentTermRowActions({ edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <RowActions
      label={`Ações do prazo ${remove.termName}`}
      actions={[
        {
          label: "Editar prazo",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Remover prazo",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      <EditPaymentTermModal
        {...edit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <RemovePaymentTermModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
