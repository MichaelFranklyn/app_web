"use client";

import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";

import { EditComponentModal } from "../EditComponentModal";
import { RemoveComponentModal } from "../RemoveComponentModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  edit: Omit<ComponentProps<typeof EditComponentModal>, Controlled>;
  remove: Omit<ComponentProps<typeof RemoveComponentModal>, Controlled>;
}

/** Editar e remover, no "⋯" da linha (ver RowActions). */
export function ComponentRowActions({ edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <RowActions
      label={`Ações do componente ${remove.componentName}`}
      actions={[
        {
          label: "Editar componente",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Remover componente",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      <EditComponentModal
        {...edit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <RemoveComponentModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
