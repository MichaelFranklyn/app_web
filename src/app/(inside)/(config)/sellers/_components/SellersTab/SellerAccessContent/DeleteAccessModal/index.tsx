"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { DELETE_SELLER_FACTORY_ACCESS_MUTATION } from "./gql";

interface DeleteAccessResponse {
  deleteSellerFactoryAccess: { status: boolean; message: string };
}

interface DeleteAccessModalProps {
  id: string;
  sellerName: string;
  factoryName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRemove: () => void;
  onRollback: () => void;
}

export function DeleteAccessModal({
  id,
  sellerName,
  factoryName,
  open,
  onOpenChange,
  onRemove,
  onRollback,
}: DeleteAccessModalProps) {
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteAccess] = useMutation<DeleteAccessResponse>(DELETE_SELLER_FACTORY_ACCESS_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    onRemove();

    await execute(
      async () => {
        const res = await deleteAccess({ variables: { id } });

        if (!res.data?.deleteSellerFactoryAccess?.status) {
          throw new Error(
            res.data?.deleteSellerFactoryAccess?.message ?? "Erro ao excluir vínculo"
          );
        }

        return res.data.deleteSellerFactoryAccess;
      },
      {
        successMessage: "Vínculo excluído com sucesso",
        onSuccess: async () => {
          onOpenChange(false);
          await invalidateClient(["seller_factory_access_list"]);
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
          title="Excluir vínculo"
          description={`Tem certeza que deseja excluir o vínculo de ${sellerName} com a fábrica ${factoryName}?`}
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
