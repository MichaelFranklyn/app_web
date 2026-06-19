import { toIsoDate } from "@/utils/format/date";
import { CreateOrderInput } from "./interface";

const extractSelectValue = (val: unknown): string => {
  if (val && typeof val === "object" && "value" in val) {
    return String((val as { value: string }).value);
  }
  return String(val ?? "");
};

export const normalizeInput = (data: Record<string, unknown>): CreateOrderInput => ({
  sellerId: extractSelectValue(data.sellerId),
  clientId: extractSelectValue(data.clientId),
  factoryId: extractSelectValue(data.factoryId),
  orderDate: toIsoDate(data.orderDate),
  // Enum GraphQL por NOME (FOB/CIF); vazio = não informado.
  freightType: extractSelectValue(data.freightType) || null,
  notes: data.notes ? String(data.notes) : null,
});

export const FREIGHT_OPTIONS = [
  { value: "FOB", label: "FOB — frete por conta do cliente" },
  { value: "CIF", label: "CIF — entrega pela fábrica" },
];
