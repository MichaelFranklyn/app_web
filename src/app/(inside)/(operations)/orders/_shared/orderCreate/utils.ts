import { toIsoDate } from "@/utils/format/date";
import {
  extractSelectValue,
  parseCoverageDays,
  parseDeliveryDays,
} from "@/utils/form";
import { CreateOrderInput } from "./interface";

/**
 * Dados do formulário → input da mutation.
 *
 * `fallbackSellerId` existe porque o campo "Vendedor" só aparece para gestor: o
 * vendedor logado não escolhe de quem é o pedido (o backend sobrescreveria de
 * qualquer jeito), então o formulário dele nem tem o campo e o id vem daqui.
 */
export const normalizeInput = (
  data: Record<string, unknown>,
  fallbackSellerId?: string | null
): CreateOrderInput => ({
  sellerId: extractSelectValue(data.sellerId) || fallbackSellerId || "",
  clientId: extractSelectValue(data.clientId),
  factoryId: extractSelectValue(data.factoryId),
  orderDate: toIsoDate(data.orderDate),
  paymentTermId: extractSelectValue(data.paymentTermId) || null,
  // Enum GraphQL por NOME (FOB/CIF); vazio = não informado.
  freightType: extractSelectValue(data.freightType) || null,
  notes: data.notes ? String(data.notes) : null,
  // Vazio → null: o backend aplica o prazo padrão da fábrica.
  deliveryEstimateDays: parseDeliveryDays(data.deliveryEstimateDays),
  // Estimativa de campo do vendedor; o backend descarta fora da faixa plausivel.
  coverageDays: parseCoverageDays(data.coverageDays),
  // "quote" = orçamento; qualquer outro valor (default) = pedido de fato.
  isQuote: extractSelectValue(data.orderKind) === "quote",
});
