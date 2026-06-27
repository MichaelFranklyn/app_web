"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { DELETE_PRICE_TIER_MUTATION } from "../gql";

interface DeleteTierResponse {
  deletePriceTier: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  tierId: string;
  tierName: string;
  onRemoved: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function RemoveTierModal({
  tierId,
  tierName,
  onRemoved,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [deleteTier] = useMutation<DeleteTierResponse>(
    DELETE_PRICE_TIER_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="ghost" color="red" size="sm" isIconOnly>
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
      title="Remover nível"
      description={`Remover o nível comercial "${tierName}"? Preços vinculados a ele também deixam de existir.`}
      confirmLabel="Remover"
      successMessage="Nível removido"
      onBeforeConfirm={() => onRemoveOptimistic(tierId)}
      onConfirm={async () => {
        const res = await deleteTier({ variables: { id: tierId } });
        if (!res.data?.deletePriceTier?.status) {
          throw new Error(
            res.data?.deletePriceTier?.message ?? "Erro ao remover nível"
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
