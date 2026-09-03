import { describe, expect, it } from "vitest";
import { columnsOf } from "./factorySection";

/**
 * A4 PAISAGEM em pontos — é a orientação do fechamento de comissões.
 *
 * O papel virou de lado quando cada linha passou a levar a situação do boleto
 * ao lado da comissão: em retrato, ou o nome do cliente saía cortado ou a
 * coluna do boleto não cabia, e é justamente a leitura "cliente → pagou? →
 * quanto" que o documento serve.
 */
const PAGE_W = 842;

describe("columnsOf", () => {
  const cols = columnsOf(PAGE_W);

  it("mantém as colunas na ordem de leitura, dentro da margem", () => {
    expect(cols.client).toBeLessThan(cols.order);
    expect(cols.order).toBeLessThan(cols.invoice);
    expect(cols.invoice).toBeLessThan(cols.sequence);
    expect(cols.sequence).toBeLessThan(cols.boleto);
    expect(cols.boleto).toBeLessThan(cols.date);
    expect(cols.date).toBeLessThan(cols.amount);
    expect(cols.amount).toBeLessThanOrEqual(PAGE_W - 40);
  });

  it("dá folga entre a data e o valor da comissão", () => {
    // A data ocupa ~50pt e o valor (alinhado à direita) chega a ~65pt em
    // "R$ 45.570,40": com menos folga que isso, um encostava no outro.
    expect(cols.amount - cols.date).toBeGreaterThanOrEqual(115);
  });

  it("cabe o rótulo mais longo do boleto", () => {
    // "Não pagou 12/03/2026" em helvetica 8.5 fica na casa dos 85pt — é o pior
    // caso da coluna, e cortá-lo esconderia justamente a data do calote.
    expect(cols.boletoMax).toBeGreaterThanOrEqual(90);
  });

  it("reserva espaço de sobra para o nome do cliente", () => {
    expect(cols.clientMax).toBeGreaterThan(200);
  });

  it("cabe uma nota com série na coluna da nota", () => {
    // "123456-1" em helvetica 8.5 fica na casa dos 35pt; a folga aqui aceita
    // numeração longa sem invadir a coluna da parcela.
    expect(cols.invoiceMax).toBeGreaterThanOrEqual(50);
  });
});
