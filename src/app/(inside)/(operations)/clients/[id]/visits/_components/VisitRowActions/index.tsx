"use client";

import { RowActions } from "@/components/RowActions";
import { VisitStockModal } from "@/components/VisitStockModal";
import { Package, Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";
import { DeleteVisitModal } from "../DeleteVisitModal";
import { EditVisitModal } from "../EditVisitModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  /** Estoque por fábrica visto na visita (corrige a previsão de esgotamento). */
  stock: { visitId: string; clientName: string; onSaved?: () => void };
  edit: Omit<ComponentProps<typeof EditVisitModal>, Controlled>;
  remove: Omit<ComponentProps<typeof DeleteVisitModal>, Controlled>;
}

/**
 * Estoque, editar e remover a visita, no "⋯" (ver
 * RowActions). O estoque vem aqui porque o vendedor nem sempre anota no
 * balcão: ele volta na visita e diz o que viu em cada fábrica.
 */
export function VisitRowActions({ stock, edit, remove }: Props) {
  const [stockOpen, setStockOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <RowActions
      label={`Ações da visita ${remove.visitLabel}`}
      actions={[
        {
          label: "Registrar estoque da visita",
          icon: Package,
          onClick: () => setStockOpen(true),
        },
        {
          label: "Editar visita",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Remover visita",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      <VisitStockModal
        itemId={stock.visitId}
        clientName={stock.clientName}
        open={stockOpen}
        onOpenChange={setStockOpen}
        onSaved={stock.onSaved}
      />
      <EditVisitModal {...edit} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteVisitModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
