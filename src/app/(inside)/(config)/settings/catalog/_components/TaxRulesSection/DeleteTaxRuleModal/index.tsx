"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { DELETE_TAX_RULE_MUTATION } from "../../../gql";
import { DeleteTaxRuleModalProps, DeleteTaxRuleResponse } from "./interface";

export function DeleteTaxRuleModal({
  ruleId,
  ruleName,
  onRemoveOptimistic,
  onCommit,
  onRollback,
  onDone,
}: DeleteTaxRuleModalProps) {
  const [deleteRule] = useMutation<DeleteTaxRuleResponse>(
    DELETE_TAX_RULE_MUTATION
  );

  return (
    <ConfirmModal
      trigger={
        <Button.Root appearance="ghost" color="red" size="sm" isIconOnly>
          <Button.Icon icon={Trash2} />
        </Button.Root>
      }
      title="Remover regra de imposto"
      description={`Tem certeza que deseja remover a regra "${ruleName}"?`}
      confirmLabel="Remover"
      successMessage="Regra de imposto removida"
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
