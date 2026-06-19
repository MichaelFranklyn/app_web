"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_SELLER_FACTORY_ACCESS_MUTATION } from "./gql";
import {
  DeleteAccessResponse,
  DeleteSellerAccessModalProps,
} from "./interface";

export function DeleteSellerAccessModal({
  accessId,
  sellerName,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: DeleteSellerAccessModalProps) {
  const [open, setOpen] = useState(false);
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteAccess] = useMutation<DeleteAccessResponse>(
    DELETE_SELLER_FACTORY_ACCESS_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    setOpen(false);
    onRemoveOptimistic(accessId);

    await execute(
      async () => {
        const res = await deleteAccess({ variables: { id: accessId } });

        if (!res.data?.deleteSellerFactoryAccess?.status) {
          throw new Error(
            res.data?.deleteSellerFactoryAccess?.message ??
              "Erro ao excluir vínculo"
          );
        }

        return res.data.deleteSellerFactoryAccess;
      },
      {
        successMessage: "Vínculo excluído com sucesso",
        onSuccess: async () => {
          onCommit();
          await invalidateClient(["sellerFactoryAccessList"]);
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
        <Button.Root appearance="ghost" color="red" size="sm" isIconOnly>
          <Button.Icon icon={Trash2} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="sm">
        <Modal.Header
          title="Excluir vínculo"
          description={`Excluir o vínculo de ${sellerName} com esta fábrica? O vendedor sai desta lista e deixa de vender por ela. Os pedidos já feitos continuam guardados. Para apenas pausar, prefira "Desativar" — aí dá para ativar de novo depois.`}
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
            color="red"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>Excluir vínculo</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
