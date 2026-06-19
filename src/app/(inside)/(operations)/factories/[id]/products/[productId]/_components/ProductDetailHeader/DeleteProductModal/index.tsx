"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useNavigation } from "@/hooks/useNavigation";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const { navigateTo } = useNavigation();
  const [deleteProduct] =
    useMutation<DeleteProductResponse>(DELETE_PRODUCT_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deleteProduct({ variables: { id: productId } });
        if (!res.data?.deleteProduct?.status) {
          throw new Error(
            res.data?.deleteProduct?.message ?? "Erro ao excluir produto"
          );
        }
        return res.data.deleteProduct;
      },
      {
        successMessage: "Produto removido com sucesso",
        onSuccess: () => {
          setOpen(false);
          navigateTo(productsHref);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="red" size="sm">
          <Button.Icon icon={Trash2} />
          <Button.Title>Excluir</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Excluir produto"
          description={`Tem certeza que deseja excluir o produto "${productName}"? Ele sai do catálogo e das tabelas de preço; pedidos já realizados não são afetados.`}
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
