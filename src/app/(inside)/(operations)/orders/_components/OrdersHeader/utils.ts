import { toIsoDate } from "@/utils/format/date";
import { extractSelectValue, parseDeliveryDays } from "@/utils/form";
import { CreateOrderInput } from "./interface";

export const normalizeInput = (
  data: Record<string, unknown>
): CreateOrderInput => ({
  sellerId: extractSelectValue(data.sellerId),
  clientId: extractSelectValue(data.clientId),
  factoryId: extractSelectValue(data.factoryId),
  orderDate: toIsoDate(data.orderDate),
  paymentTermId: extractSelectValue(data.paymentTermId) || null,
  // Enum GraphQL por NOME (FOB/CIF); vazio = não informado.
  freightType: extractSelectValue(data.freightType) || null,
  notes: data.notes ? String(data.notes) : null,
  // Vazio → null: o backend aplica o prazo padrão da fábrica.
  deliveryEstimateDays: parseDeliveryDays(data.deliveryEstimateDays),
  // "quote" = orçamento; qualquer outro valor (default) = pedido de fato.
  isQuote: extractSelectValue(data.orderKind) === "quote",
});
