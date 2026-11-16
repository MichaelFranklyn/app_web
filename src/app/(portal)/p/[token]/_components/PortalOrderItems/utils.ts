import { PortalOrderItem } from "../../interface";

export const ORDER_ITEMS_PAGE_SIZE = 10;

const normalize = (text: string): string =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Busca por nome ou código, sem diferenciar acento nem maiúscula. */
export const filterOrderItems = (
  items: PortalOrderItem[],
  query: string
): PortalOrderItem[] => {
  const term = normalize(query);
  if (!term) return items;
  return items.filter(
    (item) =>
      normalize(item.productName).includes(term) ||
      normalize(item.sku ?? "").includes(term)
  );
};

export const orderItemsPageCount = (
  total: number,
  pageSize = ORDER_ITEMS_PAGE_SIZE
): number => Math.max(1, Math.ceil(total / pageSize));

/** A fatia da página — a página é presa ao intervalo válido. */
export const orderItemsPage = <T>(
  items: T[],
  page: number,
  pageSize = ORDER_ITEMS_PAGE_SIZE
): T[] => {
  const safe = Math.min(
    Math.max(1, page),
    orderItemsPageCount(items.length, pageSize)
  );
  return items.slice((safe - 1) * pageSize, safe * pageSize);
};
