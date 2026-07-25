"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { REVOKE_SELLER_FACTORY_ACCESS_MUTATION } from "./gql";
import { UpdateAccessModalProps, UpdateResponse } from "./interface";

export function UpdateAccessModal({
  id,
  sellerName,
  factoryName,
  isActive,
  open,
  onOpenChange,
  onRevoke,
  onCommit,
  onRollback,
}: UpdateAccessModalProps) {
  const [updateAccess] = useMutation<UpdateResponse>(
    REVOKE_SELLER_FACTORY_ACCESS_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title={isActive ? "Revogar acesso" : "Ativar acesso"}
      description={`Tem certeza que deseja ${isActive ? "revogar" : "ativar"} o acesso de ${sellerName} à fábrica ${factoryName}?`}
      confirmLabel={isActive ? "Revogar acesso" : "Ativar acesso"}
      confirmColor={isActive ? "red" : "green"}
      successMessage={
        isActive ? "Acesso revogado com sucesso" : "Acesso ativado com sucesso"
      }
      onBeforeConfirm={onRevoke}
      onConfirm={async () => {
        const res = await updateAccess({
          variables: { id, input: { isActive: !isActive } },
        });
        if (!res.data?.updateSellerFactoryAccess?.status) {
          throw new Error(
            res.data?.updateSellerFactoryAccess?.message ??
              "Erro ao revogar acesso"
          );
        }
      }}
      onSuccess={onCommit}
      onError={onRollback}
    />
  );
}
