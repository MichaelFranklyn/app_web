import { formatMoney } from "@/utils/format/masks";
import { formatUnits } from "../utils";
import { PortalCatalogFactory } from "../interface";
import { OrderableProduct, OrderCartItem } from "./interface";

/** Busca vinda da URL (`?q=`): espaços aparados, vazio vira nulo. */
export function parseCatalogSearch(raw?: string | string[]): string | null {
  const value = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const trimmed = value.trim().slice(0, 80);
  return trimmed === "" ? null : trimmed;
}

/** Fábrica escolhida vinda da URL (`?f=`): vazio vira nulo. */
export function parseFactoryParam(raw?: string | string[]): string | null {
  const value = ((Array.isArray(raw) ? raw[0] : raw) ?? "").trim();
  return value === "" ? null : value.slice(0, 64);
}

/**
 * Endereço de uma página do catálogo, mantendo a busca e a fábrica. Volta
 * ancorado na lista de produtos: quem paginou ou buscou quer ver o
 * resultado, não o topo.
 */
export function orderHref(
  token: string,
  search: string | null,
  page: number,
  factoryId: string | null = null
): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (factoryId) params.set("f", factoryId);
  if (page > 1) params.set("p", String(page));
  const query = params.toString();
  return `/p/${token}/pedido${query ? `?${query}` : ""}#todos-os-produtos`;
}

/**
 * O recado do formulário. Desconto não é o cliente quem propõe — quem
 * negocia preço é o representante —, então o portal não manda mais.
 * Vazio = "sem recado".
 */
export function orderRequestFields(formData: FormData): { note?: string } {
  const note = String(formData.get("note") ?? "").trim();
  return note !== "" ? { note } : {};
}

/** Texto do campo de quantidade ("12", "1,5") em número; inválido = nulo. */
export function parseQuantity(text: string): number | null {
  const trimmed = text.trim().replace(",", ".");
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/** Embalagem mínima em número; nula, zero ou inválida = venda livre. */
export function multipleOf(saleMultiple: string | null): number | null {
  if (saleMultiple === null) return null;
  const value = Number(saleMultiple);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Número para o VALOR do campo (`type="number"` só aceita ponto) — sem o
 * ruído de ponto flutuante (0,1 × 3 = 0,30000000000000004).
 */
export const formatQuantity = (value: number): string =>
  String(Number(value.toFixed(3)));

/** Número para LER ("1.200", "1,5"). */
const showQuantity = (value: number): string =>
  formatUnits(formatQuantity(value));

const isMultiple = (quantity: number, multiple: number): boolean => {
  const ratio = quantity / multiple;
  return Math.abs(ratio - Math.round(ratio)) < 1e-9;
};

/**
 * Arredonda PARA CIMA até a embalagem mínima — o mesmo que o servidor faz
 * ao gravar o orçamento. Para cima porque a fábrica não manda meia caixa, e
 * pedir menos do que o cliente quer é pior que pedir um pouco mais.
 */
export function fitToMultiple(
  quantity: number,
  multiple: number | null
): number {
  if (multiple === null || quantity <= 0 || isMultiple(quantity, multiple)) {
    return quantity;
  }
  return Math.ceil(quantity / multiple) * multiple;
}

/**
 * O que está errado na quantidade do item, em português de balcão. Nulo =
 * pode mandar. Fora da embalagem mínima não passa: o servidor arredondaria
 * calado e o cliente levaria um susto com a quantidade.
 */
export function quantityError(item: {
  quantity: string;
  saleMultiple: string | null;
}): string | null {
  const quantity = parseQuantity(item.quantity);
  if (quantity === null || quantity <= 0) return "Informe a quantidade.";
  const multiple = multipleOf(item.saleMultiple);
  if (multiple !== null && !isMultiple(quantity, multiple)) {
    const below = Math.floor(quantity / multiple) * multiple;
    const above = fitToMultiple(quantity, multiple);
    const options =
      below > 0
        ? `${showQuantity(below)} ou ${showQuantity(above)}`
        : showQuantity(above);
    const step = showQuantity(multiple);
    return `A fábrica vende de ${step} em ${step}. Use ${options}.`;
  }
  return null;
}

/**
 * A embalagem mínima por extenso ("12 unidades"). Sem múltiplo a fábrica
 * vende avulso: "1 unidade".
 */
export function minimumPackText(saleMultiple: string | null): string {
  const multiple = multipleOf(saleMultiple) ?? 1;
  return multiple === 1 ? "1 unidade" : `${showQuantity(multiple)} unidades`;
}

/**
 * Quanto sai a embalagem mínima ("R$ 118,80 a embalagem") — nulo sem preço
 * ou quando a venda é avulsa (aí o preço da unidade já diz tudo).
 */
export function packPriceText(
  saleMultiple: string | null,
  estimatedUnitPrice: string | null | undefined
): string | null {
  const multiple = multipleOf(saleMultiple);
  if (multiple === null || multiple === 1) return null;
  if (estimatedUnitPrice === null || estimatedUnitPrice === undefined) {
    return null;
  }
  const unit = Number(estimatedUnitPrice);
  if (!Number.isFinite(unit)) return null;
  return `${formatMoney(unit * multiple)} a embalagem`;
}

/**
 * A quantidade contada em embalagens ("2 embalagens de 12 un. = 24
 * unidades"). Nula na venda avulsa, ou quando a quantidade não fecha a
 * embalagem — aí quem fala é o erro do campo.
 */
export function packCountText(item: {
  quantity: string;
  saleMultiple: string | null;
}): string | null {
  const multiple = multipleOf(item.saleMultiple);
  const quantity = parseQuantity(item.quantity);
  if (multiple === null || multiple === 1) return null;
  if (quantity === null || quantity <= 0 || !isMultiple(quantity, multiple)) {
    return null;
  }
  const packs = Math.round(quantity / multiple);
  const pack = `de ${showQuantity(multiple)} un.`;
  return packs === 1
    ? `1 embalagem ${pack}`
    : `${packs} embalagens ${pack} = ${showQuantity(quantity)} unidades`;
}

/**
 * O "−" e o "+" da lista: uma embalagem a menos ou a mais, sempre fechando a
 * embalagem e nunca abaixo de uma (para tirar o produto há a lixeira).
 */
export function stepQuantity(
  text: string,
  saleMultiple: string | null,
  direction: 1 | -1
): string {
  const step = multipleOf(saleMultiple) ?? 1;
  const parsed = parseQuantity(text);
  const units = parsed !== null && parsed > 0 ? parsed / step : 0;
  const packs =
    direction > 0 ? Math.floor(units + 1e-9) + 1 : Math.ceil(units - 1e-9) - 1;
  return formatQuantity(Math.max(1, packs) * step);
}

/** Já está na menor quantidade possível (uma embalagem)? */
export function isAtMinimumPack(
  text: string,
  saleMultiple: string | null
): boolean {
  const quantity = parseQuantity(text);
  const step = multipleOf(saleMultiple) ?? 1;
  return quantity === null || quantity <= step + 1e-9;
}

/** Quantas páginas o catálogo tem (0 sem produtos). */
export function catalogPageCount(catalog: {
  total: number;
  pageSize: number;
}): number {
  return catalog.pageSize > 0 ? Math.ceil(catalog.total / catalog.pageSize) : 0;
}

/**
 * O produto entra na lista já com a quantidade sugerida (a última compra, ou
 * a embalagem mínima), sempre encaixada na embalagem: o cliente só mexe se
 * quiser outra.
 */
export function toCartItem(product: OrderableProduct): OrderCartItem {
  const multiple = multipleOf(product.saleMultiple);
  const suggested = Number(product.suggestedQuantity);
  const base =
    Number.isFinite(suggested) && suggested > 0 ? suggested : (multiple ?? 1);
  return {
    productId: product.productId,
    productName: product.productName,
    sku: product.sku,
    factoryName: product.factoryName,
    saleMultiple: product.saleMultiple,
    estimatedUnitPrice: product.estimatedUnitPrice ?? null,
    estimatedUnitPriceWithTax: product.estimatedUnitPriceWithTax ?? null,
    lastUnitPrice: product.lastUnitPrice ?? null,
    imageUrl: product.imageUrl ?? null,
    quantity: formatQuantity(fitToMultiple(base, multiple)),
  };
}

/**
 * Chave da lista no `sessionStorage` — uma por link E por fábrica: o
 * orçamento é de uma fábrica só, e trocar de fábrica não mistura as listas.
 */
export const cartStorageKey = (token: string, factoryId: string): string =>
  `portal_order_cart_${token}_${factoryId}`;

const isCartItem = (value: unknown): value is OrderCartItem => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.productName === "string" &&
    typeof item.factoryName === "string" &&
    typeof item.quantity === "string"
  );
};

/**
 * A lista guardada no navegador. Qualquer coisa estranha (JSON quebrado,
 * formato antigo) vira lista vazia: perder a lista é chato, quebrar a tela é
 * pior.
 */
export function parseStoredCart(raw: string | null): OrderCartItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

/** A conta estimada da lista: mercadoria, imposto e o total com os dois. */
export interface CartEstimate {
  goods: number;
  /** Nulo quando algum produto veio de uma lista guardada sem o imposto. */
  tax: number | null;
  total: number;
}

/**
 * Conta ESTIMADA da lista — só quando todos os produtos têm preço. Com um
 * só sem preço, a soma mostraria um valor menor que o real.
 *
 * O imposto é a diferença entre o preço com imposto e o sem, a mesma conta do
 * detalhe do pedido. Se algum produto não traz o preço com imposto (lista
 * guardada antes dele existir), o imposto fica nulo e o total é só a
 * mercadoria — melhor não mostrar o imposto do que mostrar um pela metade.
 */
export function cartEstimate(items: OrderCartItem[]): CartEstimate | null {
  if (items.length === 0) return null;
  let goods = 0;
  let tax: number | null = 0;
  for (const item of items) {
    if (item.estimatedUnitPrice === null) return null;
    const quantity = Number(item.quantity.replace(",", "."));
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    const unit = Number(item.estimatedUnitPrice);
    goods += quantity * unit;
    const withTax = item.estimatedUnitPriceWithTax;
    tax =
      tax === null || withTax === null || withTax === undefined
        ? null
        : tax + quantity * Math.max(0, Number(withTax) - unit);
  }
  return { goods, tax, total: goods + (tax ?? 0) };
}

/** O total estimado (com imposto, quando se sabe) — nulo sem preço. */
export const cartEstimatedTotal = (items: OrderCartItem[]): number | null =>
  cartEstimate(items)?.total ?? null;

/** "1 produto" / "3 produtos". */
export const productCountLabel = (count: number): string =>
  count === 1 ? "1 produto" : `${count} produtos`;

/**
 * De qual fábrica é o orçamento: a escolhida, se ela atende o cliente; com
 * uma fábrica só, ela mesma (não há o que escolher). Nula = falta escolher —
 * não existe orçamento de "todas".
 */
export function resolveOrderFactory(
  factoryId: string | null,
  factories: PortalCatalogFactory[]
): string | null {
  if (factories.some((factory) => factory.factoryId === factoryId)) {
    return factoryId;
  }
  return factories.length === 1 ? factories[0].factoryId : null;
}

/** Nome da fábrica do orçamento; nulo enquanto o cliente não escolheu. */
export function selectedFactoryName(
  factoryId: string | null,
  factories: PortalCatalogFactory[]
): string | null {
  const resolved = resolveOrderFactory(factoryId, factories);
  return (
    factories.find((factory) => factory.factoryId === resolved)?.name ?? null
  );
}

/**
 * "Com impostos: R$ 10,45 / un." — nulo sem preço, ou quando o produto não
 * tem imposto no preço (a linha repetiria o valor de cima).
 */
export function priceWithTaxText(
  estimatedUnitPrice: string | null | undefined,
  estimatedUnitPriceWithTax: string | null | undefined
): string | null {
  if (!estimatedUnitPrice || !estimatedUnitPriceWithTax) return null;
  const base = Number(estimatedUnitPrice);
  const withTax = Number(estimatedUnitPriceWithTax);
  if (!Number.isFinite(base) || !Number.isFinite(withTax) || withTax <= base) {
    return null;
  }
  return `Com impostos: ${formatMoney(withTax)} / un.`;
}

/** "Última compra: R$ 9,50 / un." — nulo quando o cliente nunca comprou. */
export function lastPriceText(
  lastUnitPrice: string | null | undefined
): string | null {
  if (lastUnitPrice === null || lastUnitPrice === undefined) return null;
  const value = Number(lastUnitPrice);
  if (!Number.isFinite(value)) return null;
  return `Última compra: ${formatMoney(value)} / un.`;
}

/**
 * A conta de uma linha da lista, por extenso: "12 × R$ 9,90 = R$ 118,80".
 * Nula sem preço ou sem quantidade válida — aí não há conta a mostrar.
 */
export function lineEstimateText(item: OrderCartItem): string | null {
  if (item.estimatedUnitPrice === null) return null;
  const quantity = Number(item.quantity.replace(",", "."));
  const unit = Number(item.estimatedUnitPrice);
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unit)) {
    return null;
  }
  return `${formatQuantity(quantity)} × ${formatMoney(unit)} = ${formatMoney(
    quantity * unit
  )}`;
}

/** A descrição do cabeçalho — a mesma na tela e no esqueleto de carregamento. */
export const ORDER_PAGE_DESCRIPTION =
  "Escolha os produtos, ajuste as quantidades e envie ao representante. Nada é comprado agora: ele confere e confirma com você.";

/**
 * Depois de enviar: um pedido só (o caso de sempre — o orçamento é de uma
 * fábrica) abre direto nele; mais de um, ou nenhum id na resposta, abre a
 * lista dos enviados. `?enviado=1` faz a tela confirmar o envio.
 */
export function sentOrderRedirect(token: string, orderIds: string[]): string {
  return orderIds.length === 1
    ? `/p/${token}/enviados/${orderIds[0]}?enviado=1`
    : `/p/${token}/enviados?enviado=1`;
}
