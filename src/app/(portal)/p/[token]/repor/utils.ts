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
