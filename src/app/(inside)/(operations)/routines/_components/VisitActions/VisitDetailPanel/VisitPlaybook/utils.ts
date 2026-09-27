import { formatDate, toIsoDate } from "@/utils/format/date";
import { daysAgoLabel, unitsLabel } from "@/utils/productPurchase";
import { PlaybookFactory, PlaybookOffer } from "./interface";

/** Pedidos na fábrica para "está em 8 de 10" significar alguma coisa. */
const MIN_ORDERS_FOR_SHARE = 3;

/**
 * A frase de apoio de cada sugestão: quanto ele levou da última vez (a
 * quantidade para sugerir) e, quando há pedidos bastantes, o quanto o produto
 * é de sempre. "Levou 12 un. há 40 dias · em 8 de 10 pedidos".
 */
export const offerDetail = (offer: PlaybookOffer): string => {
  const last = `Levou ${unitsLabel(offer.lastUnits)} un. ${daysAgoLabel(offer.daysSinceLast)}`;
  if (offer.factoryOrderCount < MIN_ORDERS_FOR_SHARE) return last;
  return `${last} · em ${offer.orderCount} de ${offer.factoryOrderCount} pedidos`;
};

/** "Termina hoje" / "Termina amanhã" / "Até 02/10/2026" — o prazo como argumento. */
export const promoEndsLabel = (endsOn: string, today: string): string => {
  if (endsOn <= today) return "Termina hoje";
  const tomorrow = new Date(`${today}T12:00:00`);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (endsOn === toIsoDate(tomorrow)) return "Termina amanhã";
  return `Até ${formatDate(endsOn)}`;
};

/** A fábrica tem o que conversar? Negativada nunca: ela não aceita pedido novo. */
export const hasTalkingPoints = (factory: PlaybookFactory): boolean =>
  !factory.isNegative &&
  (factory.offers.length > 0 ||
    factory.promotion !== null ||
    factory.portalRequest !== null);
