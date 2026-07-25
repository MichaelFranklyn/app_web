"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
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
  const [deleteAccess] = useMutation<DeleteAccessResponse>(
    DELETE_SELLER_FACTORY_ACCESS_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title="Excluir vínculo"
      description={`Tem certeza que deseja excluir o vínculo de ${sellerName} com a fábrica ${factoryName}?`}
      confirmLabel="Excluir vínculo"
      successMessage="Vínculo excluído com sucesso"
      onBeforeConfirm={onRemove}
      onConfirm={async () => {
        const res = await deleteAccess({ variables: { id } });
        if (!res.data?.deleteSellerFactoryAccess?.status) {
          throw new Error(
            res.data?.deleteSellerFactoryAccess?.message ??
              "Erro ao excluir vínculo"
          );
        }
      }}
      onSuccess={() => {
        void invalidateClient(["seller_factory_access_list"]);
      }}
      onError={onRollback}
    />
  );
}
