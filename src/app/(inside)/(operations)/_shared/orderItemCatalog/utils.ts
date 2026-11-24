export const priceKey = (productId: string, tierId: string) =>
  `${productId}:${tierId}`;

/**
 * Nome da regra de imposto do IPI. É o mesmo nome usado pelo import de tabela
 * de preço ao gravar a alíquota no produto (`IPI_RULE_NAME` do backend).
 */
export const IPI_RULE_NAME = "IPI";

interface RankablePriceList {
  id: string;
  isActive: boolean;
  region: string;
  validFrom: string;
}

/**
 * Tabelas vigentes da fábrica, na ordem em que valem para sugerir preço.
 *
 * Pode haver mais de uma vigente (uma por região de ICMS, ou duas importadas
 * como "tabela nova" por engano). A ordem é fixa: a tabela geral (sem região)
 * primeiro, depois a de vigência mais recente e, no empate, o id. Assim o
 * mesmo pedido sugere sempre o mesmo preço, não o da tabela que o banco
 * devolveu primeiro.
 */
export const rankActivePriceLists = (lists: RankablePriceList[]): string[] =>
  lists
    .filter((list) => list.isActive)
    .sort(
      (a, b) =>
        Number(a.region !== "") - Number(b.region !== "") ||
        b.validFrom.localeCompare(a.validFrom) ||
        a.id.localeCompare(b.id)
    )
    .map((list) => list.id);

/**
 * Um preço por produto+nível: o da tabela mais bem colocada em `rankedListIds`.
 * Um produto que só existe numa tabela regional ainda ganha preço.
 */
export const pickPriceItems = <
  T extends {
    priceListId: string;
    product: { id: string } | null;
    tier: { id: string } | null;
  },
>(
  items: T[],
  rankedListIds: string[]
): T[] => {
  const rank = new Map(rankedListIds.map((id, index) => [id, index]));
  const best = new Map<string, T>();
  items.forEach((item) => {
    if (!item.product || !item.tier || !rank.has(item.priceListId)) return;
    const key = priceKey(item.product.id, item.tier.id);
    const current = best.get(key);
    if (
      !current ||
      rank.get(item.priceListId)! < rank.get(current.priceListId)!
    )
      best.set(key, item);
  });
  return [...best.values()];
};

/**
 * Escolhe o nível comercial de um item recém-selecionado, para que o preço seja
 * sugerido sem o vendedor precisar mexer no nível a cada item.
 *
 * Na ordem: o nível que já está em uso (herdado do item anterior do pedido), o
 * nível acordado no vínculo do cliente com a fábrica, ou — se o produto só tem
 * preço em um nível — esse. Os dois primeiros só valem se tiverem preço para
 * ESTE produto; senão cairia num nível que deixa o preço vazio de novo.
 *
 * Devolve "" quando nada se aplica: o vendedor escolhe o nível na mão.
 */
export const resolveTierForProduct = (
  currentTierId: string,
  linkedTierId: string | null,
  pricedTierIds: string[]
): string => {
  if (currentTierId && pricedTierIds.includes(currentTierId))
    return currentTierId;
  if (linkedTierId && pricedTierIds.includes(linkedTierId)) return linkedTierId;
  if (pricedTierIds.length === 1) return pricedTierIds[0];
  return currentTierId || linkedTierId || "";
};

/**
 * A quantidade respeita o múltiplo de venda? Tolerante a ponto flutuante:
 * múltiplos podem ser fracionários (ex.: 25,5 kg por saco).
 */
export const isQuantityMultiple = (
  quantity: number,
  multiple: number
): boolean => {
  if (!multiple || multiple <= 0) return true;
  const ratio = quantity / multiple;
  return Math.abs(ratio - Math.round(ratio)) < 1e-9;
};

/** Múltiplo como texto de campo numérico (ponto decimal, sem zeros sobrando). */
const multipleText = (multiple: number): string =>
  String(Number(multiple.toFixed(3)));

/**
 * Quantidade que entra sozinha ao escolher o produto: a embalagem mínima.
 *
 * Só preenche um campo vazio ou que ainda guarda o que foi preenchido sozinho
 * para o produto anterior (`autoFilled`) — o que o vendedor digitou nunca é
 * reescrito. Produto sem múltiplo devolve o campo vazio no lugar do valor
 * automático do anterior, que não valeria para ele.
 */
export const suggestedQuantity = (
  current: string,
  autoFilled: string,
  multiple: number | undefined | null
): string => {
  const untouched = current === "" || current === autoFilled;
  if (!untouched) return current;
  return multiple && multiple > 0 ? multipleText(multiple) : "";
};

/** Dica do campo quantidade: unidades, e a embalagem mínima quando há. */
export const quantityHint = (multiple: number | undefined | null): string =>
  multiple && multiple > 1
    ? `Em unidades. Embalagem mínima: ${multipleText(multiple)} — vendido de ${multipleText(multiple)} em ${multipleText(multiple)}.`
    : "Em unidades (peças), não em embalagens.";

/**
 * Texto do campo "Embalagem mínima" (só leitura): quantas unidades vêm numa
 * embalagem — a quantidade do item anda de quanto em quanto. Produto sem
 * múltiplo diz isso por extenso, para o campo nunca parecer esquecido.
 */
export const packMinimumText = (multiple: number | undefined | null): string =>
  multiple && multiple > 1
    ? `${multipleText(multiple)} unidades`
    : "Sem mínimo (vende por unidade)";
