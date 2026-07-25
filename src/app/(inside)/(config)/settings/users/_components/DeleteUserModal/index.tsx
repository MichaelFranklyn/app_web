"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
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

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir usuário"
      description={`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir usuário"
      successMessage="Usuário excluído com sucesso"
      onBeforeConfirm={onRemove}
      onConfirm={async () => {
        const res = await deleteUser({ variables: { id } });
        if (!res.data?.deleteUser?.status) {
          throw new Error(
            res.data?.deleteUser?.message ?? "Erro ao excluir usuário"
          );
        }
      }}
      onSuccess={() => {
        void invalidateClient(["users_list"]);
      }}
      onError={onRollback}
    />
  );
}
