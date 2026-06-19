"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { DELETE_USER_MUTATION } from "./gql";

interface DeleteUserResponse {
  deleteUser: { status: boolean; message: string };
}

interface DeleteUserModalProps {
  id: string;
  userName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRemove: () => void;
  onRollback: () => void;
}

export function DeleteUserModal({
  id,
  userName,
  open,
  onOpenChange,
  onRemove,
  onRollback,
}: DeleteUserModalProps) {
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteUser] = useMutation<DeleteUserResponse>(DELETE_USER_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    onRemove();

    await execute(
      async () => {
        const res = await deleteUser({ variables: { id } });

        if (!res.data?.deleteUser?.status) {
          throw new Error(res.data?.deleteUser?.message ?? "Erro ao excluir usuário");
        }

        return res.data.deleteUser;
      },
      {
        successMessage: "Usuário excluído com sucesso",
        onSuccess: async () => {
          onOpenChange(false);
          await invalidateClient(["users_list"]);
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Excluir usuário"
          description={`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`}
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
            <Button.Title>Excluir usuário</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
