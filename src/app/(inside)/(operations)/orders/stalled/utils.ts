import { toUtcIsoDate } from "@/utils/format/date";

const DAY_MS = 24 * 60 * 60 * 1000;

const parseIso = (iso: string): number => Date.parse(`${iso}T00:00:00Z`);

/** Dias corridos entre duas datas ISO (`YYYY-MM-DD`). */
export const daysBetween = (fromIso: string, toIso: string): number =>
  Math.round((parseIso(toIso) - parseIso(fromIso)) / DAY_MS);

/**
 * A data que a entrega recebe quando ninguém informa outra: faturamento + prazo
 * do pedido (ou o padrão), nunca depois de hoje. É a mesma conta do backend
 * (`orders/delivery.assumed_delivery_date`) — aqui só para mostrar na tabela o
 * que vai ser gravado.
 */
export const assumedDeliveryDate = (
  invoicedAt: string,
  estimateDays: number | null,
  defaultDays: number,
  todayIso: string
): string => {
  const days = estimateDays ?? defaultDays;
  const predicted = toUtcIsoDate(
    new Date(parseIso(invoicedAt) + days * DAY_MS)
  );
  return predicted < todayIso ? predicted : todayIso;
};

export const sumAmount = (orders: { totalAmount: string }[]): number =>
  orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0);
