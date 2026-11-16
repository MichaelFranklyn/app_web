import { parseNumber } from "@/utils/import/columns";

import { discountToAmount, DraftItem } from "../../_shared/orderDraftItems";
import { ReviewRow } from "./interface";

/** A linha da revisão vai para o rascunho: incluída, com produto e nível. */
const isImportable = (row: ReviewRow): boolean =>
  row.include && Boolean(row.candidate.productId) && Boolean(row.tierId);

const tierLabelOf = (row: ReviewRow): string =>
  row.candidate.tierOptions.find((option) => option.tierId === row.tierId)
    ?.tierName ??
  (row.tierId === row.candidate.tierId ? row.candidate.tierName : null) ??
  "";

/**
 * Converte as linhas conferidas na revisão em itens do rascunho de
 * `/orders/new` — o mesmo formato do item digitado, para a lista tratá-los
 * igual (editar, remover, total, piso da condição).
 *
 * - O rótulo segue o do catálogo (`código — nome`), para o item importado não
 *   parecer diferente do digitado na lista.
 * - O desconto da ficha (em %) fica em %: na edição ele volta como a pessoa
 *   combinou, e muda junto se a quantidade mudar.
 * - O mesmo produto duas vezes na planilha vira um item só, com as quantidades
 *   somadas — o rascunho não aceita produto repetido. Vale o preço, o nível e
 *   o desconto da primeira linha.
 * - `isPromo` fica falso: a pré-visualização não diz se o preço é de promoção
 *   relâmpago, e marcar sem saber gravaria um selo errado no pedido.
 */
export function reviewRowsToDraftItems(
  rows: ReviewRow[],
  ipiInOrder: boolean
): DraftItem[] {
  const byProduct = new Map<string, DraftItem>();

  for (const row of rows.filter(isImportable)) {
    const productId = row.candidate.productId as string;
    const quantity = parseNumber(row.quantity);
    const unitPrice = parseNumber(row.unitPrice);
    if (!(quantity > 0) || !(unitPrice > 0)) continue;

    const previous = byProduct.get(productId);
    if (previous) {
      const total = previous.quantity + quantity;
      byProduct.set(productId, {
        ...previous,
        quantity: total,
        discount: discountToAmount(
          previous.discountInput,
          previous.discountType,
          previous.unitPrice,
          total
        ),
      });
      continue;
    }

    const percent = row.discountPercent ?? 0;
    const name = row.candidate.productName ?? row.candidate.rawName ?? "";
    byProduct.set(productId, {
      productId,
      productLabel: row.candidate.rawSku
        ? `${row.candidate.rawSku} — ${name}`
        : name,
      tierId: row.tierId as string,
      tierLabel: tierLabelOf(row),
      unitPrice,
      quantity,
      discount: discountToAmount(percent, "PERCENT", unitPrice, quantity),
      discountInput: percent > 0 ? percent : 0,
      discountType: percent > 0 ? "PERCENT" : "VALUE",
      ipiRate: ipiInOrder ? parseNumber(row.ipiRate) || 0 : 0,
      isPromo: false,
      source: "FILE_IMPORT",
    });
  }

  return Array.from(byProduct.values());
}
