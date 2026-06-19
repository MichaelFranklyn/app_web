"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_SELLER_CLIENT_FACTORY_MUTATION } from "./gql";

interface DeleteSellerClientFactoryResponse {
  deleteSellerClientFactory: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  linkId: string;
  factoryName: string;
  onRemoved: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeleteFactoryLinkModal({
  linkId,
  factoryName,
  onRemoved,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const [deleteLink] = useMutation<DeleteSellerClientFactoryResponse>(
    DELETE_SELLER_CLIENT_FACTORY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    setOpen(false);
    onRemoveOptimistic(linkId);

    await execute(
      async () => {
        const res = await deleteLink({ variables: { id: linkId } });
        if (!res.data?.deleteSellerClientFactory?.status) {
          throw new Error(
            res.data?.deleteSellerClientFactory?.message ??
              "Erro ao remover vínculo"
          );
        }
        return res.data.deleteSellerClientFactory;
      },
      {
        successMessage: "Vínculo removido",
        onSuccess: () => {
          onCommit();
          onRemoved();
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
          color="red"
          size="xs"
          aria-label="Remover vínculo"
        >
          <Button.Icon icon={Trash2} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Remover vínculo"
          description={`Remover o vínculo com a fábrica "${factoryName}"? Esta ação não pode ser desfeita.`}
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
            <Button.Title>Remover</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
