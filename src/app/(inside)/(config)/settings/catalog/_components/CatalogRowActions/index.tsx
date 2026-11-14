"use client";

import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { CatalogRowActionsProps } from "./interface";

/**
 * Editar e excluir de uma linha de catálogo (categoria, rótulo, segmento,
 * regra de imposto, unidade).
 *
 * No desktop são os dois ícones de sempre; no cartão do celular entram no "⋯",
 * com o nome escrito (14/11/2026). Os modais são controlados daqui porque um
 * item de menu não pode ser o gatilho deles — cada seção só diz QUAL modal
 * abrir em `renderEdit`/`renderDelete`.
 */
export function CatalogRowActions({
  label,
  editLabel,
  deleteLabel,
  renderEdit,
  renderDelete,
}: CatalogRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <RowActions
      label={label}
      actions={[
        { label: editLabel, icon: Pencil, onClick: () => setIsEditOpen(true) },
        {
          label: deleteLabel,
          icon: Trash2,
          danger: true,
          onClick: () => setIsDeleteOpen(true),
        },
      ]}
    >
      {renderEdit({ open: isEditOpen, onOpenChange: setIsEditOpen })}
      {renderDelete({ open: isDeleteOpen, onOpenChange: setIsDeleteOpen })}
    </RowActions>
  );
}
