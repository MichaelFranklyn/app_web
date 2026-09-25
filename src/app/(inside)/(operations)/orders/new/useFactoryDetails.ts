import { negativeOrderHint } from "@/components/ClientFactoryNegative";
import { FormStepSchema } from "@/components/FormBuilder";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { extractSelectValue } from "@/utils/form";
import { useMemo, useState } from "react";

import { normalizeInput } from "../_shared/orderCreate";
import {
  clientOptionLabel,
  clientOptionSearchText,
} from "../../_shared/clientOption";
import {
  coverageHint,
  useCoverageSuggestion,
} from "../../_shared/orderCoverage";
import {
  FACTORY_ASSIGNMENTS_QUERY,
  FactoryAssignmentsData,
} from "../../_shared/orderAssignments";
import {
  coverageField,
  deliveryField,
  freightField,
  notesField,
  orderDateField,
  orderKindField,
  paymentTermField,
  singleSection,
} from "./fields";
import { NewOrderDetails } from "./interface";
import { NewOrderCore } from "./useNewOrderCore";

const getAssignments = (d: FactoryAssignmentsData) => d.sellerClientFactoryList;

/**
 * Novo pedido aberto da tela da fábrica: a fábrica já está decidida, e o
 * pedido nasce de um vínculo vendedor → cliente dela.
 */
export function useFactoryDetails(
  core: NewOrderCore,
  factoryId: string
): NewOrderDetails {
  const { formRef, paymentTermOptions } = core;
  const [assignmentId, setAssignmentId] = useState("");

  // Sem teto fixo: uma fábrica com carteira grande passava do limite antigo —
  // o cliente existia e a tela dizia que não. O hook rebusca pelo total quando
  // a 1ª página não dá conta.
  const byFactory = useMemo(
    () => ({
      filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
    }),
    [factoryId]
  );

  const { data, error } = useCompleteList<FactoryAssignmentsData>(
    FACTORY_ASSIGNMENTS_QUERY,
    byFactory,
    getAssignments
  );

  useQueryErrorToast(
    error,
    "Não foi possível carregar as opções. Tente novamente."
  );

  const assignments = useMemo(
    () =>
      data?.sellerClientFactoryList?.edges
        ?.map((e) => e.node)
        .filter((n) => n.seller && n.client) ?? [],
    [data]
  );

  const chosen = assignments.find((a) => a.id === assignmentId) ?? null;

  useCoverageSuggestion(formRef, chosen?.cadence);

  const assignmentOptions = useMemo(
    () =>
      assignments.map((a) => ({
        // Marcado, não escondido: o cliente sumido da lista viraria "o sistema
        // perdeu meu vínculo", e não "a fábrica travou o crédito dele".
        label: `${a.seller!.name} → ${clientOptionLabel(a.client!)}${
          a.isNegative ? " · NEGATIVADO" : ""
        }`,
        value: a.id,
        searchText: clientOptionSearchText(a.client!),
      })),
    [assignments]
  );

  const negativeHint = chosen?.isNegative
    ? negativeOrderHint(chosen.negativeReason)
    : undefined;

  const formSteps: FormStepSchema[] = useMemo(
    () =>
      singleSection([
        orderKindField,
        {
          name: "assignment",
          type: "select-single",
          label: "Vendedor → Cliente",
          placeholder:
            assignmentOptions.length === 0
              ? "Sem vínculos disponíveis para esta fábrica"
              : "Selecione o vínculo",
          required: true,
          options: assignmentOptions,
          hint: negativeHint,
          onChange: (value) => {
            const id = extractSelectValue(value);
            setAssignmentId(id);
            // O cliente decide o nível acordado que sugere o preço dos itens.
            core.setClientId(
              assignments.find((a) => a.id === id)?.clientId ?? ""
            );
          },
        },
        orderDateField,
        paymentTermField({
          options: paymentTermOptions,
          pendingPlaceholder: null,
          onChange: core.setPaymentTermId,
        }),
        freightField(core.setFreightType),
        deliveryField,
        coverageField(coverageHint(chosen?.cadence)),
        notesField,
      ]),
    // `core` muda a cada render; as condições que ele contribui já estão
    // listadas, e os setters que ele passa só mexem em estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assignments, assignmentOptions, negativeHint, paymentTermOptions, chosen]
  );

  return {
    formSteps,
    toInput: (data) => {
      const assignment = assignments.find(
        (a) => a.id === extractSelectValue(data.assignment)
      );
      // Vínculo que sumiu entre a escolha e o envio: não inventa o dono.
      if (!assignment) return null;
      return normalizeInput({
        ...data,
        sellerId: assignment.sellerId,
        clientId: assignment.clientId,
        factoryId,
      });
    },
  };
}
