"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  buildCategoriesVariables,
  categoriesRefetchQueries,
  PRODUCT_CATEGORIES_QUERY,
  ProductCategoriesData,
} from "../gql";
import { DELETE_PRODUCT_CATEGORY_MUTATION } from "./gql";

interface DeleteProductCategoryResponse {
  deleteProductCategory: {
    __typename?: "BaseResponse";
    status: boolean;
    message: string;
  };
}

interface Props {
  categoryId: string;
  categoryName: string;
}

export function DeleteCategoryModal({ categoryId, categoryName }: Props) {
  const [open, setOpen] = useState(false);
  const [deleteCategory] = useMutation<DeleteProductCategoryResponse>(
    DELETE_PRODUCT_CATEGORY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deleteCategory({
          variables: { id: categoryId },
          // Otimista: remove a linha da lista na hora. Em erro, rollback
          // automático restaura a categoria.
          optimisticResponse: {
            deleteProductCategory: {
              __typename: "BaseResponse",
              status: true,
              message: "",
            },
          },
          // Rede de segurança: ressincroniza a lista com o back após o sucesso.
          refetchQueries: categoriesRefetchQueries(),
          update: (cache) => {
            cache.updateQuery<ProductCategoriesData>(
              {
                query: PRODUCT_CATEGORIES_QUERY,
                variables: buildCategoriesVariables(),
              },
              (existing) => {
                if (!existing) return existing;
                const list = existing.product_categories;
                const edges = list.edges.filter(
                  (e) => e.node.id !== categoryId
                );
                if (edges.length === list.edges.length) return existing;
                return {
                  product_categories: {
                    ...list,
                    edges,
                    totalCount: Math.max(0, list.totalCount - 1),
                  },
                };
              }
            );
          },
        });
        if (!res.data?.deleteProductCategory?.status) {
          throw new Error(
            res.data?.deleteProductCategory?.message ??
              "Erro ao remover categoria"
          );
        }
        return res.data.deleteProductCategory;
      },
      {
        successMessage: "Categoria removida com sucesso",
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="red" size="sm" isIconOnly>
          <Button.Icon icon={Trash2} />
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Excluir categoria"
          description={`Tem certeza que deseja excluir a categoria "${categoryName}"?`}
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
