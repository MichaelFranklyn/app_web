"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { DELETE_SELLER_MUTATION } from "./gql";

interface DeleteSellerResponse {
  deleteSeller: { status: boolean; message: string };
}

interface DeleteSellerModalProps {
  id: string;
  sellerName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRemove: () => void;
  onRollback: () => void;
}

export function DeleteSellerModal({
  id,
  sellerName,
  open,
  onOpenChange,
  onRemove,
  onRollback,
}: DeleteSellerModalProps) {
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteSeller] = useMutation<DeleteSellerResponse>(
    DELETE_SELLER_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir vendedor"
      description={`Tem certeza que deseja excluir o vendedor "${sellerName}"? Todos os vínculos e histórico serão removidos.`}
      confirmLabel="Excluir vendedor"
      successMessage="Vendedor excluído com sucesso"
      onBeforeConfirm={onRemove}
      onConfirm={async () => {
        const res = await deleteSeller({ variables: { id } });
        if (!res.data?.deleteSeller?.status) {
          throw new Error(
            res.data?.deleteSeller?.message ?? "Erro ao excluir vendedor"
          );
        }
      }}
      onSuccess={() => {
        void invalidateClient(["sellers_list"]);
      }}
      onError={onRollback}
    />
  );
}
