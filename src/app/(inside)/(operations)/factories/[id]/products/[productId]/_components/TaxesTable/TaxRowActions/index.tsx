"use client";

import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";

import { EditTaxModal } from "../EditTaxModal";
import { RemoveTaxModal } from "../RemoveTaxModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  edit: Omit<ComponentProps<typeof EditTaxModal>, Controlled>;
  remove: Omit<ComponentProps<typeof RemoveTaxModal>, Controlled>;
}

/** Editar e remover, no "⋯" da linha (ver RowActions). */
export function TaxRowActions({ edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <RowActions
      label={`Ações do imposto ${remove.taxName}`}
      actions={[
        {
          label: "Editar alíquota",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Remover imposto",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      <EditTaxModal {...edit} open={editOpen} onOpenChange={setEditOpen} />
      <RemoveTaxModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
