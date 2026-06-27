import { PriceItem, PriceListGroup } from "./interface";

export { formatAmount as money } from "@/utils/format/masks";

export const UNGROUPED_KEY = "__none__";

export const ITEMS_PER_PAGE = 10;

export function groupByPriceList(items: PriceItem[]): PriceListGroup[] {
  const groups = new Map<string, PriceListGroup>();
  for (const item of items) {
    const key = item.priceList?.id ?? UNGROUPED_KEY;
    if (!groups.has(key)) {
      groups.set(key, { priceList: item.priceList, items: [] });
    }
    groups.get(key)!.items.push(item);
  }
  return Array.from(groups.values());
}
