import { toIsoDate } from "@/utils/format/date";
import { extractSelectValue } from "@/utils/form";
import { CreateOrderInput } from "./interface";

export const normalizeInput = (
  data: Record<string, unknown>
): CreateOrderInput => ({
  sellerId: extractSelectValue(data.sellerId),
  clientId: extractSelectValue(data.clientId),
  factoryId: extractSelectValue(data.factoryId),
  orderDate: toIsoDate(data.orderDate),
  // Enum GraphQL por NOME (FOB/CIF); vazio = não informado.
  freightType: extractSelectValue(data.freightType) || null,
  notes: data.notes ? String(data.notes) : null,
});
