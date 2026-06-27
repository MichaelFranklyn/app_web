"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
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

  return (
    <ConfirmModal
      trigger={
        <Button.Root
          appearance="ghost"
          color="red"
          size="xs"
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
      }}
      onError={onRollback}
    />
  );
}
