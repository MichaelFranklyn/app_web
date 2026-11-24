"use client";

import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";

import { DeleteFixedScheduleModal } from "../DeleteFixedScheduleModal";
import { FixedScheduleModal } from "../FixedScheduleModal";

type Controlled<T> = Omit<T, "open" | "onOpenChange">;

interface Props {
  clientLabel: string;
  edit: Controlled<ComponentProps<typeof FixedScheduleModal>>;
  remove: Controlled<ComponentProps<typeof DeleteFixedScheduleModal>>;
}

/** Ações da linha do dia fixo no menu "⋯" (padrão das tabelas). */
export function FixedScheduleRowActions({ clientLabel, edit, remove }: Props) {
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);

  return (
    <RowActions
      label={`Ações do dia fixo de ${clientLabel}`}
      actions={[
        {
          label: "Ajustar dia fixo",
          icon: Pencil,
          onClick: () => setEditing(true),
        },
        {
          label: "Remover dia fixo",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoving(true),
        },
      ]}
    >
      <FixedScheduleModal {...edit} open={editing} onOpenChange={setEditing} />
      <DeleteFixedScheduleModal
        {...remove}
        open={removing}
        onOpenChange={setRemoving}
      />
    </RowActions>
  );
}
