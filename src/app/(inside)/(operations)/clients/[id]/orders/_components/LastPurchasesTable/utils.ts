import { factoryName } from "@/utils/company";
import { daysAgoLabel } from "@/utils/productPurchase";
import {
  ClientLastPurchase,
  PurchaseGroupRow,
  PurchaseView,
} from "./interface";

const sellerName = (purchase: ClientLastPurchase): string =>
  purchase.seller?.name ?? "—";

/**
 * Agrupa os pares fábrica × vendedor por uma das pontas.
 *
 * Por fábrica: "quando comprou pela última vez DESTA fábrica, e com quem".
 * Por vendedor: "quando comprou pela última vez COM ESTE vendedor, e de qual
 * fábrica". A linha guarda a compra mais recente do grupo e soma as compras.
 *
 * O backend já manda do mais recente ao mais antigo (com desempate pelo horário
 * de criação); o primeiro par de cada grupo é, portanto, o mais recente — a
 * ordem de chegada é preservada em vez de reordenada aqui.
 */
export const groupPurchases = (
  purchases: ClientLastPurchase[],
  view: PurchaseView
): PurchaseGroupRow[] => {
  const groups = new Map<string, PurchaseGroupRow>();
  for (const purchase of purchases) {
    const key = view === "factory" ? purchase.factoryId : purchase.sellerId;
    const current = groups.get(key);
    if (current) {
      current.orderCount += purchase.orderCount;
      current.totalAmount += Number(purchase.totalAmount) || 0;
      continue;
    }
    groups.set(key, {
      key,
      name:
        view === "factory"
          ? factoryName(purchase.factory)
          : sellerName(purchase),
      counterpart:
        view === "factory"
          ? sellerName(purchase)
          : factoryName(purchase.factory),
      lastOrderId: purchase.lastOrderId,
      lastOrderDate: purchase.lastOrderDate,
      lastOrderAmount: purchase.lastOrderAmount,
      orderCount: purchase.orderCount,
      totalAmount: Number(purchase.totalAmount) || 0,
    });
  }
  return [...groups.values()];
};

const isoToUtcMs = (iso: string): number => {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};

/** Dias entre a data da compra e hoje (ambas datas ISO, sem hora). */
export const daysSince = (iso: string, todayIso: string): number =>
  Math.round((isoToUtcMs(todayIso) - isoToUtcMs(iso)) / 86_400_000);

/** "há 12 dias" / "ontem" / "hoje" — o tempo como a pessoa conta. */
export const sinceLabel = (iso: string, todayIso: string): string =>
  daysAgoLabel(daysSince(iso, todayIso));

/** "1 compra" / "3 compras". */
export const purchaseCountLabel = (count: number): string =>
  count === 1 ? "1 compra" : `${count} compras`;
