"use client";

import { MoreOptions } from "@/components/MoreOptions";
import { Percent, Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { CommissionAgreementModal } from "../CommissionAgreementModal";
import { DeleteAccessModal } from "../DeleteAccessModal";
import { UpdateAccessModal } from "../UpdateAccessModal";

interface AccessRowActionsProps {
  id: string;
  sellerName: string;
  sellerIsActive: boolean;
  factoryName: string;
  /** A prévia do acordo busca a comissão desta fábrica quando o modal abre. */
  factoryId: string;
  isActive: boolean;
  sellerCommissionShare: string | number | null;
  sellerCommissionBasis: string | null;
  /** Recarrega a lista depois de salvar o acordo de comissão. */
  onAgreementSaved: () => void;
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
  factoryId,
  isActive,
  sellerCommissionShare,
  sellerCommissionBasis,
  onAgreementSaved,
  onRevoke,
  onCommit,
  onRollback,
  onRemove,
}: AccessRowActionsProps) {
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);

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
            label: "Comissão do vendedor",
            icon: Percent,
            onClick: () => setAgreementOpen(true),
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
      <CommissionAgreementModal
        id={id}
        sellerName={sellerName}
        factoryName={factoryName}
        factoryId={factoryId}
        sellerCommissionShare={sellerCommissionShare}
        sellerCommissionBasis={sellerCommissionBasis}
        open={agreementOpen}
        onOpenChange={setAgreementOpen}
        onSaved={onAgreementSaved}
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
