"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { REMOVE_TAX_FROM_PRODUCT_MUTATION } from "../gql";

interface RemoveTaxResponse {
  removeTaxFromProduct: { status: boolean; message: string };
}

interface Props {
  productTaxId: string;
  taxName: string;
  onRemoved: () => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function RemoveTaxModal({
  productTaxId,
  taxName,
  onRemoved,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: Props) {
  const [removeTax] = useMutation<RemoveTaxResponse>(
    REMOVE_TAX_FROM_PRODUCT_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="ghost" color="red" size="sm" isIconOnly>
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
      title="Remover imposto"
      description={`Remover o imposto "${taxName}" deste produto?`}
      confirmLabel="Remover"
      successMessage="Imposto removido do produto"
      onBeforeConfirm={() => onRemoveOptimistic(productTaxId)}
      onConfirm={async () => {
        const res = await removeTax({ variables: { id: productTaxId } });
        if (!res.data?.removeTaxFromProduct?.status) {
          throw new Error(
            res.data?.removeTaxFromProduct?.message ?? "Erro ao remover imposto"
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
