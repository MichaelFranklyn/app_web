"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { getProductErrorMessage } from "../errors";
import { FactoryProduct, UPDATE_PRODUCT_MUTATION } from "../gql";

interface UpdateProductResponse {
  updateProduct: {
    __typename?: "ProductTypeDataResponse";
    status: boolean;
    message: string;
    data: FactoryProduct | null;
  };
}

interface Props {
  product: FactoryProduct;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChanged: () => void;
  onUpdateOptimistic: (id: string, updates: Partial<FactoryProduct>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function ToggleProductModal({
  product,
  open,
  onOpenChange,
  onChanged,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [updateProduct] = useMutation<UpdateProductResponse>(
    UPDATE_PRODUCT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const next = !product.isActive;

  const handleConfirm = async () => {
    onOpenChange(false);
    onUpdateOptimistic(product.id, { isActive: next });

    await execute(
      async () => {
        let res;
        try {
          res = await updateProduct({
            variables: { id: product.id, input: { isActive: next } },
          });
        } catch (error) {
          throw new Error(
            getProductErrorMessage(
              error,
              "Erro ao atualizar o status do produto"
            )
          );
        }

        if (!res.data?.updateProduct?.status || !res.data.updateProduct.data) {
          throw new Error(
            getProductErrorMessage(
              res.data?.updateProduct?.message,
              "Erro ao atualizar o status do produto"
            )
          );
        }

        return res.data.updateProduct.data;
      },
      {
        successMessage: next
          ? "Produto ativado com sucesso"
          : "Produto desativado com sucesso",
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
      <Modal.Content size="sm">
        <Modal.Header
          title={next ? "Ativar produto" : "Desativar produto"}
          description={`Tem certeza que deseja ${
            next ? "ativar" : "desativar"
          } o produto "${product.name}"?`}
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
            color={next ? "green" : "red"}
            size="md"
            noUppercase
            loading={isLoading}
            onClick={handleConfirm}
          >
            <Button.Title>{next ? "Ativar" : "Desativar"}</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
