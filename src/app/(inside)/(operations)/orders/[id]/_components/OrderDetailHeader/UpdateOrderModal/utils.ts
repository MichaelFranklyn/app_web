import { FormStepSchema } from "@/components/FormBuilder";
import { extractSelectValue } from "@/utils/form";

import { paymentTermLabel } from "../../../utils";

import { OrderStatus } from "../../../../interface";
// Os rótulos de status são compartilhados com a lista de pedidos → moram no pai.
import { ORDER_STATUS_LABELS } from "../../../../utils";
import { PaymentTermRef } from "../../../interface";

/** Faturado/entregue: as parcelas já nasceram do prazo vigente. */
const isInvoiced = (status: OrderStatus) =>
  status === "INVOICED" || status === "DELIVERED";

// Faturar e Entregar têm fluxo próprio (faturar gera parcelas/comissão; entregar
// grava a data e alimenta o estoque via botão "Confirmar entrega"), então
// INVOICED e DELIVERED não são opções manuais — só aparecem se o pedido já
// estiver nesse status (para exibição).
const MANUAL_STATUSES: OrderStatus[] = [
  "DRAFT",
  "SENT",
  "CONFIRMED",
  "CANCELLED",
];

export const buildUpdateOrderSteps = (
  currentStatus: OrderStatus,
  paymentTerms: PaymentTermRef[]
): FormStepSchema[] => {
  const statuses = MANUAL_STATUSES.includes(currentStatus)
    ? MANUAL_STATUSES
    : [currentStatus, ...MANUAL_STATUSES];

  return [
    {
      id: "update",
      sections: [
        {
          id: "fields",
          fields: [
            {
              name: "status",
              type: "select-single",
              label: "Status",
              placeholder: "Selecione o status",
              hint: "Para faturar o pedido, use o botão Faturar (gera as parcelas).",
              options: statuses.map((s) => ({
                value: s,
                label: ORDER_STATUS_LABELS[s],
              })),
            },
            {
              name: "freightType",
              type: "select-single",
              label: "Frete",
              placeholder: "FOB ou CIF",
              options: [
                { value: "FOB", label: "FOB — frete por conta do cliente" },
                { value: "CIF", label: "CIF — entrega pela fábrica" },
              ],
            },
            {
              name: "paymentTermId",
              type: "select-single",
              label: "Condição de pagamento",
              placeholder: "Selecione a condição",
              // Depois de faturado, as parcelas já foram geradas com o prazo
              // vigente; trocá-lo aqui não as recalcularia e o pedido passaria
              // a exibir uma condição que não corresponde ao que foi cobrado.
              disabled: isInvoiced(currentStatus) || paymentTerms.length === 0,
              // Select vazio sem explicação parece defeito: quando a fábrica
              // não tem condição cadastrada, o campo diz onde cadastrar.
              hint: isInvoiced(currentStatus)
                ? "O pedido já foi faturado — as parcelas foram geradas com esta condição."
                : paymentTerms.length === 0
                  ? "Esta fábrica ainda não tem condições cadastradas. Cadastre em Fábricas → aba Pagamentos."
                  : "Define as parcelas que serão geradas ao faturar.",
              options: paymentTerms.map((term) => ({
                value: term.id,
                label: paymentTermLabel(term),
              })),
            },
            {
              name: "deliveryEstimateDays",
              type: "number",
              label: "Prazo de entrega (dias)",
              placeholder: "Ex: 15",
              hint: "Dias estimados até a entrega, contados do faturamento. Herda o padrão da fábrica; ajuste se este pedido tiver prazo diferente.",
            },
            {
              name: "notes",
              type: "textarea",
              label: "Observações",
              placeholder: "Observações do pedido...",
              rows: 4,
            },
          ],
        },
      ],
    },
  ];
};

export const normalizeUpdateInput = (
  data: Record<string, unknown>,
  currentNotes: string | null,
  currentFreightType: string | null,
  currentStatus: OrderStatus,
  currentDeliveryEstimateDays: number | null,
  currentPaymentTermId: string | null
): Record<string, unknown> => {
  const normalized: Record<string, unknown> = {};

  const nextStatus = extractSelectValue(data.status) || null;
  if (nextStatus && nextStatus !== currentStatus) {
    normalized.status = nextStatus;
  }

  // Prazo de entrega: vazio → null (limpa); número válido → grava.
  const rawDays = String(data.deliveryEstimateDays ?? "").trim();
  const parsed = rawDays === "" ? null : Number(rawDays);
  const nextDays =
    parsed !== null && Number.isFinite(parsed) && parsed >= 0
      ? Math.round(parsed)
      : null;
  if (nextDays !== (currentDeliveryEstimateDays ?? null)) {
    normalized.deliveryEstimateDays = nextDays;
  }

  const next = data.notes != null ? String(data.notes).trim() : "";
  const current = (currentNotes ?? "").trim();
  if (next !== current) {
    normalized.notes = next === "" ? null : next;
  }
  const nextFreight = extractSelectValue(data.freightType) || null;
  if (nextFreight !== (currentFreightType ?? null)) {
    normalized.freightType = nextFreight;
  }

  // Campo desabilitado não envia nada: pedido faturado mantém a condição.
  if (!isInvoiced(currentStatus)) {
    const nextTerm = extractSelectValue(data.paymentTermId) || null;
    if (nextTerm && nextTerm !== (currentPaymentTermId ?? null)) {
      normalized.paymentTermId = nextTerm;
    }
  }

  return normalized;
};
