/**
 * O que o formulário de reposição manda: só as linhas MARCADAS.
 *
 * A quantidade vem preenchida com a última compra, e é por isso que ela sozinha
 * não basta — senão o envio pediria a lista inteira. Quem decide é o "Pedir".
 * Quantidade vazia, zero ou ilegível na linha marcada também fica de fora: o
 * cliente marcou e apagou, e "zero de X" não é pedido.
 */
export function pickedEntries(
  formData: FormData
): Array<{ productId: string; quantity: string }> {
  const picked: Array<{ productId: string; quantity: string }> = [];
  for (const [key] of formData.entries()) {
    if (!key.startsWith("pick__")) continue;
    const productId = key.replace("pick__", "");
    const raw = String(formData.get(`qty__${productId}`) ?? "")
      .trim()
      .replace(",", ".");
    const quantity = Number(raw);
    if (raw === "" || !Number.isFinite(quantity) || quantity <= 0) continue;
    picked.push({ productId, quantity: raw });
  }
  return picked;
}

/** "12" em vez de "12.0000": o Decimal do backend chega com as casas todas. */
export function formatUnits(value: string | null): string {
  if (value === null) return "";
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("pt-BR", { maximumFractionDigits: 3 })
    : value;
}

export interface ReplenishGroup<T> {
  factoryName: string;
  items: T[];
  /** Quantos já devem ter acabado (estimativa em zero ou menos). */
  runOut: number;
}

/**
 * A lista de reposição agrupada por fábrica, do mais urgente para o menos.
 *
 * Um cliente com várias fábricas chegava a ver uma grade corrida de cem
 * produtos misturados. Por fábrica ele reconhece a própria compra ("a HERC eu
 * peço no fim do mês"), e dentro dela o que já acabou vem primeiro. A fábrica
 * com o produto mais urgente abre a lista; empate, a com mais produtos
 * acabados.
 */
export function groupByFactory<
  T extends { factoryName: string; daysRemaining: number; productName: string },
>(items: T[]): ReplenishGroup<T>[] {
  const byFactory = new Map<string, T[]>();
  for (const item of items) {
    byFactory.set(item.factoryName, [
      ...(byFactory.get(item.factoryName) ?? []),
      item,
    ]);
  }
  const groups = [...byFactory.entries()].map(([factoryName, list]) => {
    const sorted = [...list].sort(
      (a, b) =>
        a.daysRemaining - b.daysRemaining ||
        a.productName.localeCompare(b.productName, "pt-BR")
    );
    return {
      factoryName,
      items: sorted,
      runOut: sorted.filter((item) => item.daysRemaining <= 0).length,
    };
  });
  return groups.sort(
    (a, b) =>
      a.items[0].daysRemaining - b.items[0].daysRemaining ||
      b.runOut - a.runOut ||
      a.factoryName.localeCompare(b.factoryName, "pt-BR")
  );
}

/** "12 produtos, 5 já devem ter acabado" — o tamanho do grupo antes de abrir. */
export function groupSummary(group: {
  items: unknown[];
  runOut: number;
}): string {
  const count = group.items.length;
  const products = count === 1 ? "1 produto" : `${count} produtos`;
  if (group.runOut === 0) return products;
  const runOut =
    group.runOut === 1
      ? "1 já deve ter acabado"
      : `${group.runOut} já devem ter acabado`;
  return `${products}, ${runOut}`;
}
