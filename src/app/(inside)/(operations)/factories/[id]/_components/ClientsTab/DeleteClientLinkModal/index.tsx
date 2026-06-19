"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_SELLER_CLIENT_FACTORY_MUTATION } from "./gql";

interface DeleteResponse {
  deleteSellerClientFactory: {
    status: boolean;
    message: string;
  };
}

interface Props {
  linkId: string;
  clientName: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeleteClientLinkModal({
  linkId,
  clientName,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const invalidateClient = useInvalidateQueriesClient();
  const [unlink] = useMutation<DeleteResponse>(
    DELETE_SELLER_CLIENT_FACTORY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    setOpen(false);
    onRemoveOptimistic(linkId);

    await execute(
      async () => {
        const res = await unlink({ variables: { id: linkId } });
        if (!res.data?.deleteSellerClientFactory?.status) {
          throw new Error(
            res.data?.deleteSellerClientFactory?.message ??
              "Erro ao desvincular cliente"
          );
        }
        return res.data.deleteSellerClientFactory;
      },
      {
        successMessage: "Cliente desvinculado com sucesso",
        onSuccess: async () => {
          onCommit();
          await invalidateClient(["sellerClientFactoryList"]);
        },
        onError: () => onRollback(),
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
          title="Desvincular cliente"
          description={`Remover o vínculo de ${clientName} com esta fábrica? O cliente deixa de comprar por ela. Os pedidos já feitos continuam guardados.`}
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
            <Button.Title>Desvincular</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
