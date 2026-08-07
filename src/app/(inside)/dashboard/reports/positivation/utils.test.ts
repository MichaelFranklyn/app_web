import { describe, expect, it } from "vitest";

import {
  PositivationCell,
  PositivationFactory,
  PositivationRow,
} from "./interface";
import { POSITIVATION_FILTER_FIELDS } from "./usePositivationFilters";
import {
  buildPositivationExportRows,
  buildPositivationHeaders,
  POSITIVATION_SORT_COLUMNS,
  POSITIVATION_SORT_LABELS,
  positivatedLabel,
  summarizeRows,
} from "./utils";

const factory = (id: string, name: string): PositivationFactory => ({
  factoryId: id,
  factoryName: name,
  linkedClients: 1,
  positivatedClients: 1,
  positivationRate: 1,
  totalAmount: "100",
});

const cell = (
  id: string,
  over: Partial<PositivationCell> = {}
): PositivationCell => ({
  factoryId: id,
  factoryName: id.toUpperCase(),
  isLinked: true,
  isPositivated: false,
  orderCount: 0,
  totalAmount: "0",
  lastOrderDate: null,
  ...over,
});

const row = (over: Partial<PositivationRow> = {}): PositivationRow => ({
  clientId: "c1",
  companyClientId: "cc1",
  clientName: "CASA DO SONO",
  sellerId: "s1",
  sellerName: "Rafael",
  linkedFactories: 2,
  positivatedFactories: 1,
  orderCount: 2,
  totalAmount: "4820",
  lastOrderDate: "2026-07-21",
  cells: [cell("herc", { isPositivated: true, orderCount: 2 }), cell("delta")],
  ...over,
});

describe("POSITIVATION_FILTER_FIELDS", () => {
  const comprou = row({ clientId: "comprou", positivatedFactories: 1 });
  const zerado = row({ clientId: "zerado", positivatedFactories: 0 });

  it("'zerados' devolve só quem não comprou nada — a fila de visita", () => {
    expect(POSITIVATION_FILTER_FIELDS.positivated.match(zerado, "no")).toBe(
      true
    );
    expect(POSITIVATION_FILTER_FIELDS.positivated.match(comprou, "no")).toBe(
      false
    );
  });

  it("'positivaram' devolve só quem comprou de alguma fábrica", () => {
    expect(POSITIVATION_FILTER_FIELDS.positivated.match(comprou, "yes")).toBe(
      true
    );
  });

  it("o filtro de fábrica olha a CÉLULA: comprou daquela fábrica no período", () => {
    // A matriz não responde isso de relance quando há muitas colunas.
    const linha = row({
      cells: [
        cell("f1", { isPositivated: true }),
        cell("f2", { isPositivated: false }),
      ],
    });
    expect(POSITIVATION_FILTER_FIELDS.factoryId.match(linha, "f1")).toBe(true);
    expect(POSITIVATION_FILTER_FIELDS.factoryId.match(linha, "f2")).toBe(false);
  });
});

describe("POSITIVATION_SORT_COLUMNS", () => {
  it("tem rótulo de papel para toda coluna ordenável", () => {
    expect(Object.keys(POSITIVATION_SORT_LABELS).sort()).toEqual(
      Object.keys(POSITIVATION_SORT_COLUMNS).sort()
    );
  });

  it("ordena dinheiro como número, não como texto", () => {
    expect(
      POSITIVATION_SORT_COLUMNS.totalAmount(row({ totalAmount: "900" }))
    ).toBe(900);
  });
});

describe("positivatedLabel", () => {
  it("resume a linha como positivadas/vinculadas", () => {
    expect(
      positivatedLabel(row({ positivatedFactories: 2, linkedFactories: 3 }))
    ).toBe("2/3");
  });
});

describe("buildPositivationHeaders", () => {
  it("põe uma coluna por fábrica entre as fixas, na ordem recebida", () => {
    const headers = buildPositivationHeaders([
      factory("f1", "Herc"),
      factory("f2", "Delta"),
    ]);
    expect(headers).toEqual([
      "Cliente",
      "Vendedor",
      "Herc",
      "Delta",
      "Positivou",
      "Pedidos",
      "Valor no período",
      "Última compra",
    ]);
  });
});

describe("buildPositivationExportRows", () => {
  const factories = [factory("herc", "Herc"), factory("delta", "Delta")];

  it("distingue 'não vinculado' de 'vinculado e não comprou'", () => {
    // É a distinção que faz o relatório existir: vazio não dá trabalho, "Não" dá.
    const [line] = buildPositivationExportRows(
      [
        row({
          cells: [
            cell("herc", { isPositivated: true }),
            cell("delta", { isLinked: false }),
          ],
        }),
      ],
      factories
    );

    expect(line[2]).toBe("Sim");
    expect(line[3]).toBe("");
  });

  it("marca 'Não' no vínculo que existe e não comprou", () => {
    const [line] = buildPositivationExportRows(
      [row({ cells: [cell("herc"), cell("delta")] })],
      factories
    );
    expect(line[2]).toBe("Não");
    expect(line[3]).toBe("Não");
  });

  it("mantém as colunas alinhadas mesmo com as células fora de ordem", () => {
    // A ordem das células não pode mandar na ordem das colunas: quem manda é a
    // lista de fábricas, senão a matriz escorrega de linha para linha.
    const [line] = buildPositivationExportRows(
      [
        row({
          cells: [
            cell("delta", { isPositivated: true }),
            cell("herc", { isLinked: false }),
          ],
        }),
      ],
      factories
    );

    expect(line[2]).toBe(""); // Herc (não vinculado)
    expect(line[3]).toBe("Sim"); // Delta (comprou)
  });

  it("grava o valor do período como número e a última compra formatada", () => {
    const [line] = buildPositivationExportRows([row()], factories);
    expect(line[5]).toBe(2); // pedidos
    expect(line[6]).toBe(4820); // valor
    expect(line[7]).toBe("21/07/2026");
  });

  it("cliente que nunca comprou sai com traço na última compra", () => {
    const [line] = buildPositivationExportRows(
      [row({ lastOrderDate: null })],
      factories
    );
    expect(line[7]).toBe("—");
  });
});

describe("summarizeRows", () => {
  it("fecha o recorte em positivados e zerados", () => {
    const totals = summarizeRows([
      row({ positivatedFactories: 1, totalAmount: "100" }),
      row({ positivatedFactories: 0, totalAmount: "0" }),
      row({ positivatedFactories: 2, totalAmount: "50" }),
    ]);

    expect(totals.clients).toBe(3);
    expect(totals.positivated).toBe(2);
    expect(totals.zeroed).toBe(1);
    expect(totals.amount).toBe(150);
  });

  it("carteira vazia não vira NaN", () => {
    expect(summarizeRows([])).toEqual({
      clients: 0,
      positivated: 0,
      zeroed: 0,
      amount: 0,
    });
  });
});
