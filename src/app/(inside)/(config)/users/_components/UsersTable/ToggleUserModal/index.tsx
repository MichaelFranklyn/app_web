"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

interface ToggleUserResponse {
  updateUser: { status: boolean; message: string };
}

const TOGGLE_USER_MUTATION = gql`
  mutation ToggleUser($id: UUID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      status
      message
    }
  }
`;

interface ToggleUserModalProps {
  id: string;
  userName: string;
  isActive: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onToggle: () => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function ToggleUserModal({
  id,
  userName,
  isActive,
  open,
  onOpenChange,
  onToggle,
  onCommit,
  onRollback,
}: ToggleUserModalProps) {
  const [updateUser] = useMutation<ToggleUserResponse>(TOGGLE_USER_MUTATION);
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    onToggle();

    await execute(
      async () => {
        const res = await updateUser({
          variables: { id, input: { isActive: !isActive } },
        });

        if (!res.data?.updateUser?.status) {
          throw new Error(res.data?.updateUser?.message ?? "Erro ao atualizar usuário");
        }

        return res.data.updateUser;
      },
      {
        successMessage: isActive ? "Usuário desativado com sucesso" : "Usuário ativado com sucesso",
        onSuccess: async () => {
          onCommit();
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
      <Modal.Content size="sm">
        <Modal.Header
          title={isActive ? "Desativar usuário" : "Ativar usuário"}
          description={`Tem certeza que deseja ${isActive ? "desativar" : "ativar"} o usuário "${userName}"?${isActive ? " O perfil de vendedor e os acessos às fábricas também serão desativados." : ""}`}
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
            <Button.Title>{isActive ? "Desativar" : "Ativar"}</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
