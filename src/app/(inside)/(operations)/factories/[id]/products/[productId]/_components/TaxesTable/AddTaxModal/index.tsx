"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { ADD_TAX_TO_PRODUCT_MUTATION, TAX_RULES_QUERY } from "../gql";
import { CreatedTaxRule, CreateTaxRuleDialog } from "./CreateTaxRuleDialog";

interface TaxRulesData {
  taxRules: {
    edges: { node: { id: string; name: string } }[];
  };
}

interface AddTaxResponse {
  addTaxToProduct: { status: boolean; message: string };
}

interface Props {
  productId: string;
  onAdded: () => void;
}

type Option = { value: string; label: string; [key: string]: unknown };

const extractValue = (raw: unknown): string =>
  raw && typeof raw === "object" && "value" in raw
    ? String((raw as { value: string }).value)
    : String(raw ?? "");

export function AddTaxModal({ productId, onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const [createdRules, setCreatedRules] = useState<CreatedTaxRule[]>([]);
  const [pendingRuleName, setPendingRuleName] = useState<string | null>(null);
  const ruleResolverRef = useRef<((opt: Option | null) => void) | null>(null);

  const { data: rulesData } = useQuery<TaxRulesData>(TAX_RULES_QUERY, {
    variables: { input: { first: 200 } },
    skip: !open,
  });

  const [addTax] = useMutation<AddTaxResponse>(ADD_TAX_TO_PRODUCT_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const ruleOptions: Option[] = useMemo(() => {
    const fetched =
      rulesData?.taxRules.edges.map((e) => ({
        value: e.node.id,
        label: e.node.name,
      })) ?? [];
    const created = createdRules.map((r) => ({ value: r.id, label: r.name }));
    const byValue = new Map<string, Option>();
    [...fetched, ...created].forEach((o) => byValue.set(o.value, o));
    return Array.from(byValue.values());
  }, [rulesData, createdRules]);

  const handleCreateRule = useCallback(
    (name: string) =>
      new Promise<Option | null>((resolve) => {
        ruleResolverRef.current = resolve;
        setPendingRuleName(name);
      }),
    []
  );

  const handleRuleCreated = (rule: CreatedTaxRule) => {
    setCreatedRules((prev) => [...prev, rule]);
    ruleResolverRef.current?.({ value: rule.id, label: rule.name });
    ruleResolverRef.current = null;
    setPendingRuleName(null);
  };

  const handleRuleCancel = () => {
    ruleResolverRef.current?.(null);
    ruleResolverRef.current = null;
    setPendingRuleName(null);
  };

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "tax",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "taxRuleId",
                type: "select-single",
                label: "Imposto",
                required: true,
                placeholder: "Selecione ou digite para criar",
                options: ruleOptions,
                onCreateOption: handleCreateRule,
              },
              {
                name: "rate",
                type: "number",
                label: "Alíquota (%)",
                required: true,
                placeholder: "Ex: 18",
              },
            ],
          },
        ],
      },
    ],
    [ruleOptions, handleCreateRule]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      setCreatedRules([]);
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const taxRuleId = extractValue(data.taxRuleId);
    const rate = String(data.rate ?? "").trim();

    await execute(
      async () => {
        const res = await addTax({
          variables: { input: { productId, taxRuleId, rate } },
        });
        if (!res.data?.addTaxToProduct?.status) {
          throw new Error(
            res.data?.addTaxToProduct?.message ?? "Erro ao vincular imposto"
          );
        }
        return res.data.addTaxToProduct;
      },
      {
        successMessage: "Imposto vinculado com sucesso",
        onSuccess: async () => {
          handleClose(false);
          onAdded();
        },
      }
    );
  };

  return (
    <>
      <Modal.Root open={open} onOpenChange={handleClose}>
        <Modal.Trigger asChild>
          <Button.Root appearance="solid" color="amber" size="sm">
            <Button.Icon icon={Plus} />
            <Button.Title>Vincular imposto</Button.Title>
          </Button.Root>
        </Modal.Trigger>

        <Modal.Content size="sm">
          <Modal.Header
            title="Vincular imposto"
            description="Atrele uma regra de imposto a este produto e defina a alíquota."
          />
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
              <Button.Title>Vincular</Button.Title>
            </Button.Root>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      <CreateTaxRuleDialog
        open={pendingRuleName !== null}
        initialName={pendingRuleName ?? ""}
        onCancel={handleRuleCancel}
        onCreated={handleRuleCreated}
      />
    </>
  );
}
