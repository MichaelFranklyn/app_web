"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DELETE_TAX_RULE_MUTATION } from "../../gql";

interface Props {
  ruleId: string;
  ruleName: string;
  onDone: () => void;
}

export function DeleteTaxRuleModal({ ruleId, ruleName, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [deleteRule] = useMutation<{
    deleteTaxRule: { status: boolean; message: string };
  }>(DELETE_TAX_RULE_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const handleConfirm = async () => {
    await execute(
      async () => {
        const res = await deleteRule({ variables: { id: ruleId } });
        if (!res.data?.deleteTaxRule?.status) {
          throw new Error(
            res.data?.deleteTaxRule?.message ?? "Erro ao remover regra de imposto"
          );
        }
        return res.data.deleteTaxRule;
      },
      {
        successMessage: "Regra de imposto removida",
        onSuccess: () => {
          setOpen(false);
          onDone();
        },
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
          title="Remover regra de imposto"
          description={`Tem certeza que deseja remover a regra "${ruleName}"?`}
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
            <Button.Title>Remover</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
