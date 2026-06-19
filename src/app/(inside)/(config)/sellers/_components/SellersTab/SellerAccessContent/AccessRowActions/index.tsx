"use client";

import { MoreOptions } from "@/components/MoreOptions";
import { Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteAccessModal } from "../DeleteAccessModal";
import { UpdateAccessModal } from "../UpdateAccessModal";

interface AccessRowActionsProps {
  id: string;
  sellerName: string;
  sellerIsActive: boolean;
  factoryName: string;
  isActive: boolean;
  onRevoke: () => void;
  onCommit: () => void;
  onRollback: () => void;
  onRemove: () => void;
}

export function AccessRowActions({
  id,
  sellerName,
  sellerIsActive,
  factoryName,
  isActive,
  onRevoke,
  onCommit,
  onRollback,
  onRemove,
}: AccessRowActionsProps) {
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canActivate = isActive || sellerIsActive;

  return (
    <>
      <MoreOptions
        options={[
          {
            label: isActive
              ? "Revogar acesso"
              : sellerIsActive
                ? "Ativar acesso"
                : "Ativar acesso (vendedor inativo)",
            icon: Power,
            disabled: !canActivate,
            onClick: () => setUpdateOpen(true),
          },
          {
            label: "Excluir vínculo",
            icon: Trash2,
            danger: true,
            onClick: () => setDeleteOpen(true),
          },
        ]}
      />
      <UpdateAccessModal
        id={id}
        sellerName={sellerName}
        factoryName={factoryName}
        isActive={isActive}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onRevoke={onRevoke}
        onCommit={onCommit}
        onRollback={onRollback}
      />
      <DeleteAccessModal
        id={id}
        sellerName={sellerName}
        factoryName={factoryName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onRemove={onRemove}
        onRollback={onRollback}
      />
    </>
  );
}
