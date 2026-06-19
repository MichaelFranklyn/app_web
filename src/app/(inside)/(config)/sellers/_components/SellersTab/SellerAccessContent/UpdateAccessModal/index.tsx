"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
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
  const [updateAccess] = useMutation<UpdateResponse>(REVOKE_SELLER_FACTORY_ACCESS_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    onRevoke();

    await execute(
      async () => {
        const res = await updateAccess({
          variables: { id, input: { isActive: !isActive } },
        });

        if (!res.data?.updateSellerFactoryAccess?.status) {
          throw new Error(
            res.data?.updateSellerFactoryAccess?.message ?? "Erro ao revogar acesso"
          );
        }

        return res.data.updateSellerFactoryAccess;
      },
      {
        successMessage: isActive ? "Acesso revogado com sucesso" : "Acesso ativado com sucesso",
        onSuccess: () => {
          onOpenChange(false);
          onCommit();
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          title={isActive ? "Revogar acesso" : "Ativar acesso"}
          description={`Tem certeza que deseja ${isActive ? "revogar" : "ativar"} o acesso de ${sellerName} à fábrica ${factoryName}?`}
        />

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color={isActive ? "red" : "green"}
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>{isActive ? "Revogar acesso" : "Ativar acesso"}</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
