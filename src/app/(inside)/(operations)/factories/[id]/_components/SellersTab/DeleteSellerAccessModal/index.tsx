"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
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
  const invalidateClient = useInvalidateQueriesClient();
  const [deleteAccess] = useMutation<DeleteAccessResponse>(
    DELETE_SELLER_FACTORY_ACCESS_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="ghost" color="red" size="sm" isIconOnly>
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
      size="sm"
      title="Excluir vínculo"
      description={`Excluir o vínculo de ${sellerName} com esta fábrica? O vendedor sai desta lista e deixa de vender por ela. Os pedidos já feitos continuam guardados. Para apenas pausar, prefira "Desativar" — aí dá para ativar de novo depois.`}
      confirmLabel="Excluir vínculo"
      successMessage="Vínculo excluído com sucesso"
      onBeforeConfirm={() => onRemoveOptimistic(accessId)}
      onConfirm={async () => {
        const res = await deleteAccess({ variables: { id: accessId } });
        if (!res.data?.deleteSellerFactoryAccess?.status) {
          throw new Error(
            res.data?.deleteSellerFactoryAccess?.message ??
              "Erro ao excluir vínculo"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        void invalidateClient(["sellerFactoryAccessList"]);
      }}
      onError={onRollback}
    />
  );
}
