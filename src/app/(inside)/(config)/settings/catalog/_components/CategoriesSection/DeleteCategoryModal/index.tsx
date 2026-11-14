"use client";

import type { CatalogModalControl } from "../../../interface";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
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
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
  onChanged: () => void;
}

export function DeleteCategoryModal({
  categoryId,
  categoryName,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  onChanged,
  open,
  onOpenChange,
}: Props & CatalogModalControl) {
  const [deleteCategory] = useMutation<DeleteProductCategoryResponse>(
    DELETE_PRODUCT_CATEGORY_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir categoria"
      description={`Tem certeza que deseja excluir a categoria "${categoryName}"?`}
      confirmLabel="Excluir"
      successMessage="Categoria removida com sucesso"
      onBeforeConfirm={() => onRemoveOptimistic(categoryId)}
      onConfirm={async () => {
        const res = await deleteCategory({ variables: { id: categoryId } });
        if (!res.data?.deleteProductCategory?.status) {
          throw new Error(
            res.data?.deleteProductCategory?.message ??
              "Erro ao remover categoria"
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
