import { parseMoneyToNumber } from "@/utils/format/masks";
import { extractSelectValue } from "@/utils/form";

import { PriceDraftRow, TaxDraftRow } from "./interface";

/** Número tolerante a vírgula decimal ("18,5" → 18.5); vazio/ inválido → 0. */
export function toNumber(raw: unknown): number {
  const parsed = Number(String(raw ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Linhas do passo "Impostos" prontas para envio. Linhas incompletas (o repeater
 * começa com uma linha em branco) são descartadas em silêncio.
 */
export function parseTaxRows(rows: unknown): TaxDraftRow[] {
  if (!Array.isArray(rows)) return [];

  return rows.flatMap((row) => {
    const raw = (row ?? {}) as Record<string, unknown>;
    const taxRuleId = extractSelectValue(raw.taxRuleId);
    const rate = toNumber(raw.rate);
    if (!taxRuleId || rate <= 0) return [];
    return [{ taxRuleId, rate }];
  });
}

/** Idem para o passo "Preços": exige tabela, nível e preço maior que zero. */
export function parsePriceRows(rows: unknown): PriceDraftRow[] {
  if (!Array.isArray(rows)) return [];

  return rows.flatMap((row) => {
    const raw = (row ?? {}) as Record<string, unknown>;
    const priceListId = extractSelectValue(raw.priceListId);
    const tierId = extractSelectValue(raw.tierId);
    const unitPrice = parseMoneyToNumber(String(raw.unitPrice ?? ""));
    if (!priceListId || !tierId || !unitPrice || unitPrice <= 0) return [];
    return [{ priceListId, tierId, unitPrice }];
  });
}

const asRows = (rows: unknown): Record<string, unknown>[] =>
  Array.isArray(rows)
    ? rows.map((row) => (row ?? {}) as Record<string, unknown>)
    : [];

/** Linha começada e não terminada: preencheu um campo e deixou outro vazio. */
const isPartial = (filled: boolean[]): boolean =>
  filled.some(Boolean) && !filled.every(Boolean);

/**
 * Avisa quando uma linha de imposto/preço ficou pela metade. Sem isto a linha
 * seria descartada em silêncio e o usuário acharia que cadastrou.
 */
export function findIncompleteStep(
  taxRows: unknown,
  priceRows: unknown
): string | null {
  const taxIncomplete = asRows(taxRows).some((raw) =>
    isPartial([
      Boolean(extractSelectValue(raw.taxRuleId)),
      toNumber(raw.rate) > 0,
    ])
  );
  if (taxIncomplete) {
    return "Há um imposto sem alíquota (ou alíquota sem imposto). Complete ou remova a linha.";
  }

  const priceIncomplete = asRows(priceRows).some((raw) =>
    isPartial([
      Boolean(extractSelectValue(raw.priceListId)),
      Boolean(extractSelectValue(raw.tierId)),
      parseMoneyToNumber(String(raw.unitPrice ?? "")) > 0,
    ])
  );
  if (priceIncomplete) {
    return "Há um preço incompleto: informe tabela, nível e valor — ou remova a linha.";
  }

  return null;
}

/** Resumo do que foi gravado além do produto, para o toast de sucesso. */
export function buildExtrasSummary(taxes: number, prices: number): string {
  const parts: string[] = [];
  if (taxes > 0) parts.push(`${taxes} imposto${taxes === 1 ? "" : "s"}`);
  if (prices > 0) parts.push(`${prices} preço${prices === 1 ? "" : "s"}`);
  if (parts.length === 0) return "Produto cadastrado com sucesso";
  return `Produto cadastrado com ${parts.join(" e ")}`;
}
