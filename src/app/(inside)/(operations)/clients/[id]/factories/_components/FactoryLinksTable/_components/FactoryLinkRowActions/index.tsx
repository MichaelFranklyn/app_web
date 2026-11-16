"use client";

import { useNegativeLinkAction } from "@/components/ClientFactoryNegative";
import { RowActions } from "@/components/RowActions";
import { Pencil, Trash2 } from "lucide-react";
import { ComponentProps, useState } from "react";
import { EditFactoryLinkModal } from "../EditFactoryLinkModal";
import { DeleteFactoryLinkModal } from "../DeleteFactoryLinkModal";

type Controlled = "open" | "onOpenChange";

interface Props {
  negative: Parameters<typeof useNegativeLinkAction>[0];
  edit: Omit<ComponentProps<typeof EditFactoryLinkModal>, Controlled>;
  remove: Omit<ComponentProps<typeof DeleteFactoryLinkModal>, Controlled>;
}

/** Negativar, editar e remover o vínculo; no celular entram no "⋯". */
export function FactoryLinkRowActions({ negative, edit, remove }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const negativeAction = useNegativeLinkAction(negative);

  return (
    <RowActions
      label={`Ações da fábrica ${remove.factoryName}`}
      actions={[
        negativeAction.action,
        {
          label: "Editar vínculo",
          icon: Pencil,
          onClick: () => setEditOpen(true),
        },
        {
          label: "Remover vínculo",
          icon: Trash2,
          danger: true,
          onClick: () => setRemoveOpen(true),
        },
      ]}
    >
      {negativeAction.modal}
      <EditFactoryLinkModal
        {...edit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteFactoryLinkModal
        {...remove}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </RowActions>
  );
}
