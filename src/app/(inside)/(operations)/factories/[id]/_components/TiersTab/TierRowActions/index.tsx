"use client";

import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";
import { EditTierModal } from "../EditTierModal";
import { RemoveTierModal } from "../RemoveTierModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  edit: Omit<ComponentProps<typeof EditTierModal>, Controlled>;
  remove: Omit<ComponentProps<typeof RemoveTierModal>, Controlled>;
}

/** Editar e remover, no "⋯" (ver RowActions). */
export function TierRowActions({ edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <RowActions
      label={`Ações do nível ${remove.tierName}`}
      actions={[
        {
          label: "Editar nível",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Remover nível",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      <EditTierModal {...edit} open={editOpen} onOpenChange={setEditOpen} />
      <RemoveTierModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
