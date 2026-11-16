import { PortalStockItem } from "../interface";

/** A descrição de "Meu estoque" — a mesma na tela e no esqueleto. */
export const STOCK_PAGE_DESCRIPTION =
  "Quantos dias cada produto ainda dura na sua loja? Preencha só o que você souber — isso ajuda seu representante a chegar na hora certa.";

export const STOCK_PAGE_SIZE = 10;

/** Até quantos dias o produto conta como "acabando" — o mesmo corte do badge. */
const LOW_STOCK_DAYS = 15;

export type StockFilter = "all" | "low" | "unknown";

export const STOCK_FILTERS: Array<{ value: StockFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "low", label: "Acabando" },
  { value: "unknown", label: "Sem estimativa" },
];

const normalize = (text: string): string =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const matchesFilter = (item: PortalStockItem, filter: StockFilter): boolean => {
  if (filter === "low") {
    return item.daysRemaining !== null && item.daysRemaining <= LOW_STOCK_DAYS;
  }
  if (filter === "unknown") return item.daysRemaining === null;
  return true;
};

/** Quantos produtos cada faixa do filtro mostra. */
export const stockFilterCounts = (
  items: PortalStockItem[]
): Record<StockFilter, number> => ({
  all: items.length,
  low: items.filter((item) => matchesFilter(item, "low")).length,
  unknown: items.filter((item) => matchesFilter(item, "unknown")).length,
});

/**
 * Os produtos que a busca (nome, código ou fábrica, sem diferenciar acento) e
 * a faixa do filtro deixam passar, na ordem em que chegaram.
 */
export const filterStock = (
  items: PortalStockItem[],
  query: string,
  filter: StockFilter
): PortalStockItem[] => {
  const term = normalize(query);
  return items.filter(
    (item) =>
      matchesFilter(item, filter) &&
      (!term ||
        normalize(item.productName).includes(term) ||
        normalize(item.sku ?? "").includes(term) ||
        normalize(item.factoryName).includes(term))
  );
};

export const stockPageCount = (total: number): number =>
  Math.max(1, Math.ceil(total / STOCK_PAGE_SIZE));

/** Os ids da página atual — a página é presa ao intervalo válido. */
export const stockPageIds = (
  items: PortalStockItem[],
  page: number
): Set<string> => {
  const safe = Math.min(Math.max(1, page), stockPageCount(items.length));
  return new Set(
    items
      .slice((safe - 1) * STOCK_PAGE_SIZE, safe * STOCK_PAGE_SIZE)
      .map((item) => item.productId)
  );
};

/** O texto do botão: diz quantos produtos vão, quando o cliente já preencheu. */
export const stockSubmitLabel = (filled: number): string => {
  if (filled === 0) return "Enviar para o meu representante";
  if (filled === 1) return "Enviar 1 produto para o meu representante";
  return `Enviar ${filled} produtos para o meu representante`;
};

/**
 * As fábricas da lista, na ordem em que aparecem. Como a lista vem com o mais
 * perto de acabar no topo, a primeira é a da urgência maior — é ela que a tela
 * abre.
 */
export const stockFactories = (items: PortalStockItem[]): string[] =>
  Array.from(new Set(items.map((item) => item.factoryName)));

/** Os produtos de uma fábrica; sem fábrica escolhida, todos. */
export const itemsOfFactory = (
  items: PortalStockItem[],
  factory: string | null
): PortalStockItem[] =>
  factory === null
    ? items
    : items.filter((item) => item.factoryName === factory);
