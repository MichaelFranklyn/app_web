"use client";

import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";
import { EditPriceListModal } from "../EditPriceListModal";
import { DeletePriceListModal } from "../DeletePriceListModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  edit: Omit<ComponentProps<typeof EditPriceListModal>, Controlled>;
  remove: Omit<ComponentProps<typeof DeletePriceListModal>, Controlled>;
}

/** Editar e remover; no celular entram no "⋯" (ver RowActions). */
export function PriceListRowActions({ edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <RowActions
      label={`Ações da tabela ${remove.priceListName}`}
      actions={[
        {
          label: "Editar tabela de preço",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Remover tabela de preço",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      <EditPriceListModal
        {...edit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeletePriceListModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
