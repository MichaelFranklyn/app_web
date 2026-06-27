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
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CREATE_TAX_RULE_MUTATION } from "../../../gql";
import { AddTaxRuleModalProps, CreateTaxRuleResponse } from "./interface";

export function AddTaxRuleModal({
  onAddOptimistic,
  onDone,
}: AddTaxRuleModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [createRule] = useMutation<CreateTaxRuleResponse>(
    CREATE_TAX_RULE_MUTATION
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

  const handleSubmit = async (data: Record<string, unknown>) => {
    const value = String(data.name ?? "").trim();
    await execute(
      async () => {
        const res = await createRule({
          variables: { input: { name: value } },
        });
        if (!res.data?.createTaxRule?.status) {
          throw new Error(
            res.data?.createTaxRule?.message ?? "Erro ao criar regra de imposto"
          );
        }
        return res.data.createTaxRule;
      },
      {
        successMessage: "Regra de imposto criada",
        onSuccess: () => {
          setOpen(false);
          formRef.current?.resetForm();
          onAddOptimistic({ id: `temp-${Date.now()}`, name: value });
          onDone();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Nova regra</Button.Title>
        </Button.Root>
      </Modal.Trigger>
      <Modal.Content size="sm">
        <Modal.Header title="Nova regra de imposto" />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
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
            <Button.Title>Criar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
