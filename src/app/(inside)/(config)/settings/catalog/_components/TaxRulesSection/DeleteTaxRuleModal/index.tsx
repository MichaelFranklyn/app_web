"use client";

import type { CatalogModalControl } from "../../../interface";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { DELETE_TAX_RULE_MUTATION } from "../../../gql";
import { formatProductCount } from "../utils";
import { DeleteTaxRuleModalProps, DeleteTaxRuleResponse } from "./interface";

export function DeleteTaxRuleModal({
  ruleId,
  ruleName,
  productCount,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  onDone,
  open,
  onOpenChange,
}: DeleteTaxRuleModalProps & CatalogModalControl) {
  const [deleteRule] = useMutation<DeleteTaxRuleResponse>(
    DELETE_TAX_RULE_MUTATION
  );

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Remover regra de imposto"
      description={
        productCount === 0
          ? `Nenhum produto usa a regra "${ruleName}". Pode remover sem efeito nos preços.`
          : `A alíquota de "${ruleName}" sai de ${formatProductCount(productCount)} e os preços com imposto são recalculados. Pedidos já feitos não mudam.`
      }
      confirmLabel="Remover"
      successMessage={
        productCount === 0
          ? "Regra de imposto removida"
          : `Regra removida e preços de ${formatProductCount(productCount)} recalculados`
      }
      onBeforeConfirm={() => onRemoveOptimistic(ruleId)}
      onConfirm={async () => {
        const res = await deleteRule({ variables: { id: ruleId } });
        if (!res.data?.deleteTaxRule?.status) {
          throw new Error(
            res.data?.deleteTaxRule?.message ??
              "Erro ao remover regra de imposto"
          );
        }
      }}
      onSuccess={() => {
        onCommit();
        onDone();
      }}
      onError={onRollback}
    />
  );
}
