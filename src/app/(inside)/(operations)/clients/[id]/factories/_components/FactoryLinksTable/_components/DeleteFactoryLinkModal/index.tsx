"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { CLIENT_FACTORY_LINK_CACHE_FIELDS } from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
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
  const [deleteLink] = useMutation<DeleteSellerClientFactoryResponse>(
    DELETE_SELLER_CLIENT_FACTORY_MUTATION
  );
  const invalidateClient = useInvalidateQueriesClient();

  return (
    <ConfirmModal
      trigger={
        <Button.Root
          appearance="ghost"
          color="red"
          size="sm"
          aria-label="Remover vínculo"
        >
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
      title="Remover vínculo"
      description={`Remover o vínculo com a fábrica "${factoryName}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Remover"
      successMessage="Vínculo removido"
      onBeforeConfirm={() => onRemoveOptimistic(linkId)}
      onConfirm={async () => {
        const res = await deleteLink({ variables: { id: linkId } });
        if (!res.data?.deleteSellerClientFactory?.status) {
          throw new Error(
            res.data?.deleteSellerClientFactory?.message ??
              "Erro ao remover vínculo"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        onRemoved();
        // Igual ao desvínculo pela aba da fábrica: a outra ponta lê a mesma
        // lista de vínculos.
        void invalidateClient(CLIENT_FACTORY_LINK_CACHE_FIELDS);
      }}
      onError={onRollback}
    />
  );
}
