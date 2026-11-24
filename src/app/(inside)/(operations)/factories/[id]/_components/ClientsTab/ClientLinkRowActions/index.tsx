"use client";

import { useNegativeLinkAction } from "@/components/ClientFactoryNegative";
import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";
import { EditClientLinkModal } from "../EditClientLinkModal";
import { DeleteClientLinkModal } from "../DeleteClientLinkModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  negative: Parameters<typeof useNegativeLinkAction>[0];
  edit: Omit<ComponentProps<typeof EditClientLinkModal>, Controlled>;
  remove: Omit<ComponentProps<typeof DeleteClientLinkModal>, Controlled>;
}

/** Negativar, editar e remover o vínculo, no "⋯". */
export function ClientLinkRowActions({ negative, edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const negativeAction = useNegativeLinkAction(negative);

  return (
    <RowActions
      label={`Ações do cliente ${remove.clientName}`}
      actions={[
        negativeAction.action,
        {
          label: "Editar vínculo",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Desvincular cliente",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      {negativeAction.modal}
      <EditClientLinkModal
        {...edit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteClientLinkModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
