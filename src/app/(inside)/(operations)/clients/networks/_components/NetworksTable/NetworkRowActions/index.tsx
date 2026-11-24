"use client";

import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";

import { EditNetworkModal } from "../EditNetworkModal";
import { DeleteNetworkModal } from "../DeleteNetworkModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  edit: Omit<ComponentProps<typeof EditNetworkModal>, Controlled>;
  remove: Omit<ComponentProps<typeof DeleteNetworkModal>, Controlled>;
}

/** Editar e remover, no "⋯" da linha (ver RowActions). */
export function NetworkRowActions({ edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <RowActions
      label={`Ações da rede ${edit.network.name}`}
      actions={[
        {
          label: "Editar rede",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Remover rede",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      <EditNetworkModal {...edit} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteNetworkModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
