"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useNavigation } from "@/hooks/useNavigation";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { DELETE_FACTORY_PRICE_LIST_MUTATION } from "../gql";

interface DeletePriceListResponse {
  deleteFactoryPriceList: { status: boolean; message: string };
}

interface Props {
  priceListId: string;
  priceListName: string;
  priceListsHref: string;
}

export function DeletePriceListModal({
  priceListId,
  priceListName,
  priceListsHref,
}: Props) {
  const { navigateTo } = useNavigation();
  const [deletePriceList] = useMutation<DeletePriceListResponse>(
    DELETE_FACTORY_PRICE_LIST_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="outline" color="red" size="sm">
          <Button.Icon icon={Trash2} />
          <Button.Title>Excluir</Button.Title>
        </Button.Root>
      }
      title="Remover tabela de preço"
      description={`Remover a tabela "${priceListName}"? Todos os preços lançados nela também serão removidos.`}
      confirmLabel="Excluir"
      successMessage="Tabela de preço removida"
      closeOnSuccess={false}
      onConfirm={async () => {
        const res = await deletePriceList({ variables: { id: priceListId } });
        if (!res.data?.deleteFactoryPriceList?.status) {
          throw new Error(
            res.data?.deleteFactoryPriceList?.message ??
              "Erro ao remover tabela de preço"
          );
        }
      }}
      onSuccess={() => navigateTo(priceListsHref)}
    />
  );
}
