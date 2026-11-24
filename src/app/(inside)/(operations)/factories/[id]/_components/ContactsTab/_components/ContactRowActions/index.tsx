"use client";

import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";
import { EditContactModal } from "../EditContactModal";
import { DeleteContactModal } from "../DeleteContactModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  edit: Omit<ComponentProps<typeof EditContactModal>, Controlled>;
  remove: Omit<ComponentProps<typeof DeleteContactModal>, Controlled>;
}

/** Editar e remover, no "⋯" (ver RowActions). */
export function ContactRowActions({ edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <RowActions
      label={`Ações do contato ${edit.contact.name}`}
      actions={[
        {
          label: "Editar contato",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Remover contato",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      <EditContactModal {...edit} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteContactModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
