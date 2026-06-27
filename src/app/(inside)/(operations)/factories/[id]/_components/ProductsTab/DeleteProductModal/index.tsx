"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { getProductErrorMessage } from "../errors";
import { DELETE_PRODUCT_MUTATION } from "./gql";

interface DeleteProductResponse {
  deleteProduct: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChanged: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function DeleteProductModal({
  productId,
  productName,
  open,
  onOpenChange,
  onChanged,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [deleteProduct] = useMutation<DeleteProductResponse>(
    DELETE_PRODUCT_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir produto"
      description={`Tem certeza que deseja excluir o produto "${productName}"? Ele sai do catálogo e das tabelas de preço; pedidos já realizados não são afetados. Para só tirar de novos pedidos, use "Desativar".`}
      confirmLabel="Excluir"
      successMessage="Produto removido com sucesso"
      onBeforeConfirm={() => onRemoveOptimistic(productId)}
      onConfirm={async () => {
        let res;
        try {
          res = await deleteProduct({ variables: { id: productId } });
        } catch (error) {
          throw new Error(
            getProductErrorMessage(error, "Erro ao remover produto")
          );
        }
        if (!res.data?.deleteProduct?.status) {
          throw new Error(
            getProductErrorMessage(
              res.data?.deleteProduct?.message,
              "Erro ao remover produto"
            )
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        onChanged();
      }}
      onError={onRollback}
    />
  );
}
