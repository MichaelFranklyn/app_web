"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { UPDATE_TAX_RULE_MUTATION } from "../../../gql";
import { EditTaxRuleModalProps, UpdateTaxRuleResponse } from "./interface";

export function EditTaxRuleModal({
  rule,
  onUpdateOptimistic,
  onCommit,
  onRollback,
  onDone,
}: EditTaxRuleModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [updateRule] = useMutation<UpdateTaxRuleResponse>(
    UPDATE_TAX_RULE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "rule",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "name",
                type: "text",
                label: "Nome do imposto",
                required: true,
                placeholder: "Ex: ICMS, IPI",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const initialData = useMemo(() => ({ name: rule.name }), [rule]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const name = String(data.name ?? "").trim();
    if (!name || name === rule.name) {
      setOpen(false);
      return;
    }
    setOpen(false);
    onUpdateOptimistic(rule.id, { name });

    await execute(
      async () => {
        const res = await updateRule({
          variables: { id: rule.id, input: { name } },
        });
        if (!res.data?.updateTaxRule?.status) {
          throw new Error(
            res.data?.updateTaxRule?.message ??
              "Erro ao atualizar regra de imposto"
          );
        }
        return res.data.updateTaxRule;
      },
      {
        successMessage: "Regra de imposto atualizada",
        onSuccess: () => {
          onCommit();
          onDone();
        },
        onError: () => onRollback(),
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="ghost" color="neutral" size="sm" isIconOnly>
          <Button.Icon icon={Pencil} />
        </Button.Root>
      </Modal.Trigger>
      <Modal.Content size="sm">
        <Modal.Header
          title="Editar regra de imposto"
          description={`Altere o nome de "${rule.name}".`}
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={initialData}
            unstyled
          />
        </Modal.Body>
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
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
