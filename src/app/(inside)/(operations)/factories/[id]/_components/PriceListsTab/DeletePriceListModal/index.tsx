"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { DELETE_FACTORY_PRICE_LIST_MUTATION } from "../gql";

interface DeletePriceListResponse {
  deleteFactoryPriceList: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  priceListId: string;
  priceListName: string;
  onRemoved: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeletePriceListModal({
  priceListId,
  priceListName,
  onRemoved,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [deletePriceList] = useMutation<DeletePriceListResponse>(
    DELETE_FACTORY_PRICE_LIST_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="ghost" color="red" size="sm" isIconOnly>
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
      title="Remover tabela de preço"
      description={`Remover a tabela "${priceListName}"? Todos os preços lançados nela também serão removidos.`}
      confirmLabel="Remover"
      successMessage="Tabela de preço removida"
      onBeforeConfirm={() => onRemoveOptimistic(priceListId)}
      onConfirm={async () => {
        const res = await deletePriceList({ variables: { id: priceListId } });
        if (!res.data?.deleteFactoryPriceList?.status) {
          throw new Error(
            res.data?.deleteFactoryPriceList?.message ??
              "Erro ao remover tabela de preço"
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
