"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_CLIENT_CONTACT_MUTATION } from "../../gql";
import { DeleteClientContactResponse } from "../../interface";

interface Props {
  clientId: string;
  contactId: string;
  contactName: string;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeleteContactModal({
  contactId,
  contactName,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [open, setOpen] = useState(false);
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteContact] = useMutation<DeleteClientContactResponse>(
    DELETE_CLIENT_CONTACT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    setOpen(false);
    onRemoveOptimistic(contactId);

    await execute(
      async () => {
        const res = await deleteContact({ variables: { id: contactId } });
        if (!res.data?.deleteClientContact?.status) {
          throw new Error(
            res.data?.deleteClientContact?.message ?? "Erro ao remover contato"
          );
        }
        return res.data.deleteClientContact;
      },
      {
        successMessage: "Contato removido",
        onSuccess: async () => {
          onCommit();
          await invalidateClient(["clientContacts"]);
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
          aria-label="Remover contato"
        >
          <Button.Icon icon={Trash2} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Remover contato"
          description={`Remover o contato "${contactName}"? Esta ação não pode ser desfeita.`}
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
