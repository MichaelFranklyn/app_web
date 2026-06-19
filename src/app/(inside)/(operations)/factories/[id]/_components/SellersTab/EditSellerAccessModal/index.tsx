"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Power } from "lucide-react";
import { useState } from "react";
import { UPDATE_SELLER_FACTORY_ACCESS_MUTATION } from "./gql";
import {
  EditSellerAccessModalProps,
  UpdateAccessResponse,
} from "./interface";

export function EditSellerAccessModal({
  accessId,
  sellerName,
  isActive,
  sellerIsActive,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: EditSellerAccessModalProps) {
  const [open, setOpen] = useState(false);
  const invalidateClient = useInvalidateQueriesClient();
  const [updateAccess] = useMutation<UpdateAccessResponse>(
    UPDATE_SELLER_FACTORY_ACCESS_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const canActivate = isActive || sellerIsActive;

  const handleConfirm = async () => {
    setOpen(false);
    onUpdateOptimistic(accessId, { isActive: !isActive });

    await execute(
      async () => {
        const res = await updateAccess({
          variables: { id: accessId, input: { isActive: !isActive } },
        });

        if (
          !res.data?.updateSellerFactoryAccess?.status ||
          !res.data.updateSellerFactoryAccess.data
        ) {
          throw new Error(
            res.data?.updateSellerFactoryAccess?.message ??
              "Erro ao atualizar acesso"
          );
        }

        return res.data.updateSellerFactoryAccess.data;
      },
      {
        successMessage: isActive
          ? "Acesso desativado com sucesso"
          : "Acesso ativado com sucesso",
        onSuccess: async () => {
          onCommit();
          await invalidateClient([
            "factory_seller_accesses",
            "sellerFactoryAccessList",
          ]);
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="xs"
          noUppercase
          disabled={!canActivate}
        >
          <Button.Icon icon={Power} />
          <Button.Title>{isActive ? "Desativar" : "Ativar"}</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="sm">
        <Modal.Header
          title={isActive ? "Desativar acesso" : "Ativar acesso"}
          description={`Tem certeza que deseja ${
            isActive ? "desativar" : "ativar"
          } o acesso de ${sellerName} a esta fábrica?`}
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
            <Button.Title>
              {isActive ? "Desativar acesso" : "Ativar acesso"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
