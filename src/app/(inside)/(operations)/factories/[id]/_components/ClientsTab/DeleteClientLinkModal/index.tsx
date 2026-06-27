"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
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
  const invalidateClient = useInvalidateQueriesClient();
  const [unlink] = useMutation<DeleteResponse>(
    DELETE_SELLER_CLIENT_FACTORY_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="ghost" color="red" size="sm" isIconOnly>
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
      size="sm"
      title="Desvincular cliente"
      description={`Remover o vínculo de ${clientName} com esta fábrica? O cliente deixa de comprar por ela. Os pedidos já feitos continuam guardados.`}
      confirmLabel="Desvincular"
      successMessage="Cliente desvinculado com sucesso"
      onBeforeConfirm={() => onRemoveOptimistic(linkId)}
      onConfirm={async () => {
        const res = await unlink({ variables: { id: linkId } });
        if (!res.data?.deleteSellerClientFactory?.status) {
          throw new Error(
            res.data?.deleteSellerClientFactory?.message ??
              "Erro ao desvincular cliente"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        void invalidateClient(["sellerClientFactoryList"]);
      }}
      onError={onRollback}
    />
  );
}
