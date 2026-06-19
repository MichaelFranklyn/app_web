"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { getProductErrorMessage } from "../errors";
import { DELETE_PRODUCT_MUTATION } from "./gql";

interface DeleteProductResponse {
  deleteProduct: { __typename?: "BaseResponse"; status: boolean; message: string };
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
  const [deleteProduct] =
    useMutation<DeleteProductResponse>(DELETE_PRODUCT_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    onOpenChange(false);
    onRemoveOptimistic(productId);

    await execute(
      async () => {
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
        return res.data.deleteProduct;
      },
      {
        successMessage: "Produto removido com sucesso",
        onSuccess: () => {
          onCommit();
          onChanged();
        },
        onError: () => {
          onRollback();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Excluir produto"
          description={`Tem certeza que deseja excluir o produto "${productName}"? Ele sai do catálogo e das tabelas de preço; pedidos já realizados não são afetados. Para só tirar de novos pedidos, use "Desativar".`}
        />
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="red"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>Excluir</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
