"use client";

import type { CatalogModalControl } from "../../../interface";
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
import { UPDATE_TAX_RULE_MUTATION } from "../../../gql";
import { Title } from "@/components/Title";
import { IPI_RULE_NAME } from "../utils";
import { EditTaxRuleModalProps, UpdateTaxRuleResponse } from "./interface";

export function EditTaxRuleModal({
  rule,
  onUpdateOptimistic,
  onCommit,
  onRollback,
  onDone,
  open,
  onOpenChange: setOpen,
}: EditTaxRuleModalProps & CatalogModalControl) {
  const formRef = useRef<FormBuilderRef>(null);
  const [updateRule] = useMutation<UpdateTaxRuleResponse>(
    UPDATE_TAX_RULE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  // O preço acha o IPI pelo nome para somá-lo à base da ST (o back recusa).
  const isIpi = rule.name === IPI_RULE_NAME;

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
      <Modal.Content size="sm">
        <Modal.Header
          title="Editar regra de imposto"
          description={
            isIpi
              ? "A regra IPI não pode ser renomeada."
              : `Altere o nome de "${rule.name}".`
          }
        />
        <Modal.Body>
          {isIpi ? (
            <Title variant="body-sm">
              O IPI entra na base de cálculo da substituição tributária, e o
              sistema o reconhece pelo nome &quot;IPI&quot;. Com outro nome, os
              preços com ST sairiam errados. As alíquotas de IPI de cada produto
              continuam editáveis na tabela de preços.
            </Title>
          ) : (
            <FormBuilder
              ref={formRef}
              steps={steps}
              onSubmit={handleSubmit}
              loading={isLoading}
              initialData={initialData}
              unstyled
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              disabled={isLoading}
            >
              <Button.Title>{isIpi ? "Fechar" : "Cancelar"}</Button.Title>
            </Button.Root>
          </Modal.Close>
          {!isIpi && (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              loading={isLoading}
              onClick={() => formRef.current?.submitForm()}
            >
              <Button.Title>Salvar</Button.Title>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
