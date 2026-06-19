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
import { useMemo, useRef } from "react";
import { CREATE_TAX_RULE_MUTATION } from "../../gql";

export interface CreatedTaxRule {
  id: string;
  name: string;
}

interface CreateTaxRuleResponse {
  createTaxRule: {
    status: boolean;
    message: string;
    data: CreatedTaxRule | null;
  };
}

interface Props {
  open: boolean;
  initialName: string;
  onCancel: () => void;
  onCreated: (rule: CreatedTaxRule) => void;
}

export function CreateTaxRuleDialog({
  open,
  initialName,
  onCancel,
  onCreated,
}: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const [createTaxRule] = useMutation<CreateTaxRuleResponse>(
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

  const initialData = useMemo(() => ({ name: initialName }), [initialName]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const res = await createTaxRule({
          variables: {
            input: {
              name: String(data.name ?? "").trim(),
            },
          },
        });

        if (!res.data?.createTaxRule?.status || !res.data.createTaxRule.data) {
          throw new Error(
            res.data?.createTaxRule?.message ?? "Erro ao criar regra de imposto"
          );
        }

        return res.data.createTaxRule.data;
      },
      {
        successMessage: "Regra de imposto criada com sucesso",
        onSuccess: async (rule) => {
          formRef.current?.resetForm();
          onCreated(rule);
        },
      }
    );
  };

  return (
    <Modal.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <Modal.Content size="sm">
        <Modal.Header
          title="Nova regra de imposto"
          description="Cadastre a regra para vinculá-la ao produto."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
        </Modal.Body>
        <Modal.Footer>
          <Button.Root
            type="button"
            appearance="ghost"
            color="neutral"
            size="md"
            noUppercase
            disabled={isLoading}
            onClick={onCancel}
          >
            <Button.Title>Cancelar</Button.Title>
          </Button.Root>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Criar regra</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
