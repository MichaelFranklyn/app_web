import { PriceDraftRow, TaxDraftRow } from "./interface";

export interface ExtrasResult {
  taxes: number;
  prices: number;
  /** Mensagens das linhas que não foram gravadas (o produto já existe). */
  failures: string[];
}

type Sender<T> = (row: T) => Promise<void>;

/**
 * Grava impostos e preços do produto recém-criado, uma linha por vez.
 *
 * O produto já está no banco quando isto roda: uma linha que falha não desfaz
 * as anteriores nem o produto — a falha volta descrita para virar um aviso e o
 * usuário completa o que faltou no detalhe do produto.
 */
export async function createProductExtras(
  taxRows: TaxDraftRow[],
  priceRows: PriceDraftRow[],
  sendTax: Sender<TaxDraftRow>,
  sendPrice: Sender<PriceDraftRow>
): Promise<ExtrasResult> {
  const result: ExtrasResult = { taxes: 0, prices: 0, failures: [] };

  for (const row of taxRows) {
    try {
      await sendTax(row);
      result.taxes += 1;
    } catch (error) {
      result.failures.push(
        `Imposto de ${row.rate}%: ${error instanceof Error ? error.message : "erro ao vincular"}`
      );
    }
  }

  for (const row of priceRows) {
    try {
      await sendPrice(row);
      result.prices += 1;
    } catch (error) {
      result.failures.push(
        `Preço: ${error instanceof Error ? error.message : "erro ao cadastrar"}`
      );
    }
  }

  return result;
}
