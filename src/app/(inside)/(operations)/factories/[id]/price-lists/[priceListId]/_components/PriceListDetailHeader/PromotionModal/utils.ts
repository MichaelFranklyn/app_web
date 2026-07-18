import { maskCurrency, parseMoneyToNumber } from "@/utils/format/masks";

import { PromotionItemNode, PromotionProduct } from "./interface";

/**
 * Agrupa os itens por PRODUTO só para exibição — cada produto mostra suas linhas
 * de nível, e o preço promocional é definido por NÍVEL (o preço pode variar de
 * um nível para outro). Ordena produtos e níveis por nome.
 */
export const groupItemsByProduct = (
  nodes: PromotionItemNode[]
): PromotionProduct[] => {
  const byId = new Map<string, PromotionProduct>();
  // A varredura por cursor pode repetir um item entre páginas; deduplica por
  // item.id para não gerar linhas com chave repetida (e preço duplicado no save).
  const seen = new Set<string>();

  nodes.forEach((node) => {
    if (!node.product || !node.tier) return;
    if (seen.has(node.id)) return;
    seen.add(node.id);
    const existing = byId.get(node.product.id);
    if (existing) {
      existing.items.push(node);
    } else {
      byId.set(node.product.id, {
        id: node.product.id,
        name: node.product.name,
        sku: node.product.sku,
        items: [node],
      });
    }
  });

  const products = [...byId.values()];
  products.forEach((p) =>
    p.items.sort((a, b) =>
      (a.tier?.name ?? "").localeCompare(b.tier?.name ?? "")
    )
  );
  return products.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Preços promocionais já gravados, prontos para semear o formulário — chaveados
 * por `item.id` e MASCARADOS como moeda ("9,90"), no mesmo formato dos campos.
 */
export const seedPromoByItem = (
  nodes: PromotionItemNode[]
): Record<string, string> => {
  const seed: Record<string, string> = {};
  nodes.forEach((node) => {
    if (node.promoPrice != null) {
      seed[node.id] = maskCurrency(Number(node.promoPrice).toFixed(2));
    }
  });
  return seed;
};

/** Converte os campos mascarados ("9,90") em números > 0, por `item.id`. */
export const parsePromoInputs = (
  promoByItem: Record<string, string>
): Record<string, number> => {
  const result: Record<string, number> = {};
  Object.entries(promoByItem).forEach(([itemId, masked]) => {
    const value = parseMoneyToNumber(masked);
    if (Number.isFinite(value) && value > 0) result[itemId] = value;
  });
  return result;
};

export interface PromotionItemInput {
  productId: string;
  tierId: string;
  promoPrice: number;
}

/**
 * Monta o payload da mutação a partir dos preços já parseados por `item.id`
 * (produto × nível). Ignora itens sem preço válido.
 */
export const buildPromotionItems = (
  nodes: PromotionItemNode[],
  priceByItem: Record<string, number>
): PromotionItemInput[] => {
  const result: PromotionItemInput[] = [];
  const seen = new Set<string>();
  nodes.forEach((node) => {
    if (!node.product || !node.tier || seen.has(node.id)) return;
    const price = priceByItem[node.id];
    if (!price || price <= 0) return;
    seen.add(node.id);
    result.push({
      productId: node.product.id,
      tierId: node.tier.id,
      promoPrice: price,
    });
  });
  return result;
};

/** Quantos itens (níveis) têm preço promocional válido (resumo/validação). */
export const countPromotedItems = (
  priceByItem: Record<string, number>
): number => Object.keys(priceByItem).length;
