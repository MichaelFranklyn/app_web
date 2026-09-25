import { negativeOrderHint } from "@/components/ClientFactoryNegative";
import { FormStepSchema } from "@/components/FormBuilder";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { clientName } from "@/utils/company";
import { extractSelectValue } from "@/utils/form";
import { useMemo, useState } from "react";

import { normalizeInput } from "../_shared/orderCreate";
import {
  coverageHint,
  useCoverageSuggestion,
} from "../../_shared/orderCoverage";
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
import { CLIENT_ASSIGNMENTS_QUERY } from "./gql";
import { ClientAssignmentsData, NewOrderDetails } from "./interface";
import { NewOrderCore } from "./useNewOrderCore";

// Carteira do cliente carregada por inteiro (ver useCompleteList).
const getAssignments = (d: ClientAssignmentsData) => d.sellerClientFactoryList;

/**
 * Novo pedido aberto da tela do cliente: o cliente já está decidido, e o
 * pedido nasce de um dos vínculos vendedor → fábrica dele.
 */
export function useClientDetails(
  core: NewOrderCore,
  clientId: string
): NewOrderDetails {
  const { formRef, factoryId, paymentTermOptions } = core;
  const [assignmentId, setAssignmentId] = useState("");

  const byClient = useMemo(
    () => ({
      filters: [{ field: "client_id", operator: "eq", value: clientId }],
    }),
    [clientId]
  );

  const { data, error } = useCompleteList<ClientAssignmentsData>(
    CLIENT_ASSIGNMENTS_QUERY,
    byClient,
    getAssignments
  );

  useQueryErrorToast(
    error,
    "Não foi possível carregar os vínculos do cliente. Tente novamente."
  );

  const assignments = useMemo(
    () =>
      data?.sellerClientFactoryList?.edges
        ?.map((e) => e.node)
        .filter((n) => n.seller && n.factory) ?? [],
    [data]
  );

  const assignmentOptions = useMemo(
    () =>
      assignments.map((a) => ({
        // O vínculo negativado continua na lista, marcado: escondê-lo faria a
        // fábrica sumir sem explicação para quem não sabe da negativação.
        label: `${a.seller!.name} → ${
          a.factory!.nomeFantasia ?? a.factory!.razaoSocial
        }${a.isNegative ? " · NEGATIVADO" : ""}`,
        value: a.id,
      })),
    [assignments]
  );

  const chosen = assignments.find((a) => a.id === assignmentId) ?? null;
  const negativeHint = chosen?.isNegative
    ? negativeOrderHint(chosen.negativeReason)
    : undefined;

  useCoverageSuggestion(formRef, chosen?.cadence);

  const formSteps: FormStepSchema[] = useMemo(
    () =>
      singleSection([
        orderKindField,
        {
          name: "assignment",
          type: "select-single",
          label: "Vendedor → Fábrica",
          placeholder:
            assignmentOptions.length === 0
              ? "Cliente sem vínculos cadastrados"
              : "Selecione o vínculo",
          required: true,
          options: assignmentOptions,
          hint: negativeHint,
          // Ao escolher o vínculo já sabemos a fábrica: os itens carregam o
          // catálogo dela enquanto o vendedor preenche o resto.
          onChange: (value, setValue) => {
            const id = extractSelectValue(value);
            const assignment = assignments.find((a) => a.id === id);
            setAssignmentId(id);
            core.setFactoryId(assignment?.factoryId ?? "");
            // Condições de pagamento são da fábrica: trocar o vínculo
            // invalida a escolhida.
            setValue("paymentTermId", "");
          },
        },
        orderDateField,
        paymentTermField({
          options: paymentTermOptions,
          pendingPlaceholder: factoryId ? null : "Selecione o vínculo primeiro",
          onChange: core.setPaymentTermId,
        }),
        freightField(core.setFreightType),
        deliveryField,
        coverageField(coverageHint(chosen?.cadence)),
        notesField,
      ]),
    // `core` muda a cada render; a fábrica e as condições que ele contribui já
    // estão listadas, e os setters que ele passa só mexem em estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      assignmentOptions,
      assignments,
      factoryId,
      negativeHint,
      paymentTermOptions,
      chosen,
    ]
  );

  const first = assignments[0]?.client;

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
        factoryId: assignment.factoryId,
        clientId,
      });
    },
    subject: first ? clientName(first) : null,
  };
}
