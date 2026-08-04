"use client";

import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { extractSelectValue } from "@/utils/form";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { SET_SELLER_GOAL_MUTATION } from "../../gql";
import { SetGoalModalProps, SetGoalResponse } from "./interface";

/** Campo vazio = indicador sem meta; zero é uma meta de verdade (não vender). */
const toTarget = (raw: unknown): number | null => {
  const text = String(raw ?? "").trim();
  if (text === "") return null;
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) ? value : null;
};

export function useSetGoal({
  periodMonthIso,
  row,
  fixedSellerId,
  sellerOptions,
  factoryOptions,
  onSaved,
}: SetGoalModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();
  const [setSellerGoal] = useMutation<SetGoalResponse>(
    SET_SELLER_GOAL_MUTATION
  );

  // Editando uma linha existente, vendedor e fábrica são o que são: mudar um
  // deles seria outra meta, não a edição desta.
  const isEditing = Boolean(row);
  const lockedSellerId = row?.sellerId ?? fixedSellerId ?? null;
  const lockedFactoryId = row?.factoryId ?? null;

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "goal",
        sections: [
          {
            id: "target",
            fields: [
              ...(lockedSellerId
                ? []
                : [
                    {
                      name: "sellerId",
                      type: "select-single" as const,
                      label: "Vendedor",
                      required: true,
                      placeholder: "Selecione o vendedor",
                      options: sellerOptions,
                    },
                  ]),
              ...(lockedFactoryId
                ? []
                : [
                    {
                      name: "factoryId",
                      type: "select-single" as const,
                      label: "Fábrica",
                      required: true,
                      placeholder: "Selecione a fábrica",
                      options: factoryOptions,
                    },
                  ]),
              {
                name: "targetInvoicedAmount",
                type: "number",
                label: "Meta de faturamento (R$)",
                hint: "Quanto a fábrica deve faturar no mês. Deixe em branco para não acompanhar.",
              },
              {
                name: "targetOrderedAmount",
                type: "number",
                label: "Meta de vendas (R$)",
                hint: "Quanto o vendedor deve vender no mês, mesmo sem a fábrica ter faturado.",
              },
              {
                name: "targetPositivations",
                type: "number",
                label: "Meta de clientes que compram",
                hint: "Quantos clientes diferentes devem fazer pedido no mês.",
              },
              {
                name: "targetVisits",
                type: "number",
                label: "Meta de visitas",
                hint: "Visitas presenciais concluídas no mês.",
              },
            ],
          },
        ],
      },
    ],
    [lockedSellerId, lockedFactoryId, sellerOptions, factoryOptions]
  );

  const initialData = useMemo(
    () => ({
      sellerId: sellerOptions.find((o) => o.value === lockedSellerId) ?? null,
      factoryId:
        factoryOptions.find((o) => o.value === lockedFactoryId) ?? null,
      targetInvoicedAmount: row?.targetInvoicedAmount ?? "",
      targetOrderedAmount: row?.targetOrderedAmount ?? "",
      targetPositivations: row?.targetPositivations ?? "",
      targetVisits: row?.targetVisits ?? "",
    }),
    [row, lockedSellerId, lockedFactoryId, sellerOptions, factoryOptions]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) formRef.current?.resetForm();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const sellerId = lockedSellerId ?? extractSelectValue(data.sellerId);
    const factoryId = lockedFactoryId ?? extractSelectValue(data.factoryId);
    if (!sellerId || !factoryId) {
      throw new Error("Escolha o vendedor e a fábrica da meta.");
    }

    const targets = {
      targetInvoicedAmount: toTarget(data.targetInvoicedAmount),
      targetOrderedAmount: toTarget(data.targetOrderedAmount),
      targetPositivations: toTarget(data.targetPositivations),
      targetVisits: toTarget(data.targetVisits),
    };
    if (Object.values(targets).every((value) => value === null)) {
      throw new Error(
        "Informe ao menos uma meta (faturamento, vendas, clientes ou visitas)."
      );
    }

    await execute(
      async () => {
        const res = await setSellerGoal({
          variables: {
            input: {
              sellerId,
              factoryId,
              periodMonth: periodMonthIso,
              ...targets,
            },
          },
        });
        if (!res.data?.setSellerGoal?.status) {
          throw new Error(
            res.data?.setSellerGoal?.message ?? "Erro ao salvar a meta"
          );
        }
        return res.data.setSellerGoal;
      },
      {
        successMessage: isEditing ? "Meta atualizada" : "Meta definida",
        onSuccess: () => {
          handleClose(false);
          onSaved();
        },
      }
    );
  };

  return {
    open,
    handleClose,
    formRef,
    steps,
    initialData,
    handleSubmit,
    isLoading,
    isEditing,
  };
}
