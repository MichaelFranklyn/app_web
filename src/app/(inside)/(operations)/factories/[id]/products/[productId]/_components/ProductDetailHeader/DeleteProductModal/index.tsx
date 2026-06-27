"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useNavigation } from "@/hooks/useNavigation";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { DELETE_PRODUCT_MUTATION } from "./gql";

interface DeleteProductResponse {
  deleteProduct: { status: boolean; message: string };
}

interface Props {
  productId: string;
  productName: string;
  productsHref: string;
}

export function DeleteProductModal({
  productId,
  productName,
  productsHref,
}: Props) {
  const { navigateTo } = useNavigation();
  const [deleteProduct] = useMutation<DeleteProductResponse>(
    DELETE_PRODUCT_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="outline" color="red" size="sm">
          <Button.Icon icon={Trash2} />
          <Button.Title>Excluir</Button.Title>
        </Button.Root>
      }
      title="Excluir produto"
      description={`Tem certeza que deseja excluir o produto "${productName}"? Ele sai do catálogo e das tabelas de preço; pedidos já realizados não são afetados.`}
      confirmLabel="Excluir"
      successMessage="Produto removido com sucesso"
      closeOnSuccess={false}
      onConfirm={async () => {
        const res = await deleteProduct({ variables: { id: productId } });
        if (!res.data?.deleteProduct?.status) {
          throw new Error(
            res.data?.deleteProduct?.message ?? "Erro ao excluir produto"
          );
        }
      }}
      onSuccess={() => navigateTo(productsHref)}
    />
  );
}
