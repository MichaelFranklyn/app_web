import { describe, expect, it } from "vitest";

import { ClientReportRow } from "./interface";
import {
  buildClientsExportRows,
  buildClientsFilters,
  cityAndState,
  daysSinceOrder,
  idleLabel,
  scoreLabel,
  sellerNames,
} from "./utils";

const TODAY = new Date(Date.UTC(2026, 7, 3)); // 03/08/2026

const client = (over: Partial<ClientReportRow> = {}): ClientReportRow => ({
  id: "c1",
  cnpj: "12345678000199",
  razaoSocial: "CASA DO SONO LTDA",
  nomeFantasia: "Casa do Sono",
  addressCity: "Salvador",
  addressState: "BA",
  isNeedsAttention: false,
  companyClient: {
    id: "cc1",
    visitScoreTotal: "62.4",
    lastOrderDate: "2026-07-21",
    lastVisitDate: "2026-07-25",
    network: { id: "n1", name: "Rede Boa Compra" },
    segment: { id: "sg1", name: "Colchoaria" },
    sellers: [{ id: "s1", name: "Rafael" }],
  },
  ...over,
});

describe("buildClientsFilters", () => {
  it("a carteira é um retrato de hoje: nenhum filtro de data entra", () => {
    // O período do relatório governa só o gráfico de atraso; recortar a carteira
    // por data esconderia o cliente que não compra há um ano — o mais importante.
    expect(buildClientsFilters(null)).toEqual([]);
  });

  it("filtra por vendedor quando o gestor escolheu um", () => {
    expect(buildClientsFilters("s1")).toEqual([
      { field: "seller_id", operator: "eq", value: "s1" },
    ]);
  });
});

describe("daysSinceOrder", () => {
  it("conta os dias desde a última compra", () => {
    expect(daysSinceOrder("2026-07-21", TODAY)).toBe(13);
  });

  it("comprou hoje conta zero", () => {
    expect(daysSinceOrder("2026-08-03", TODAY)).toBe(0);
  });

  it("nunca comprou devolve null — que não é zero", () => {
    // Zero diria "comprou hoje", o oposto do que aconteceu.
    expect(daysSinceOrder(null, TODAY)).toBeNull();
    expect(daysSinceOrder(undefined, TODAY)).toBeNull();
  });

  it("data futura não vira número negativo", () => {
    expect(daysSinceOrder("2026-09-01", TODAY)).toBe(0);
  });
});

describe("idleLabel", () => {
  it("diz 'nunca comprou' em vez de um número", () => {
    expect(idleLabel(null)).toBe("nunca comprou");
  });

  it("escreve os dias em linguagem concreta", () => {
    expect(idleLabel(new Date().toISOString().slice(0, 10))).toBe("0 dias");
  });
});

describe("cityAndState", () => {
  it("junta cidade e UF na mesma célula", () => {
    expect(cityAndState(client())).toBe("Salvador / BA");
  });

  it("sem endereço devolve traço", () => {
    expect(
      cityAndState(client({ addressCity: null, addressState: null }))
    ).toBe("—");
  });

  it("com só uma das duas partes não deixa barra solta", () => {
    expect(cityAndState(client({ addressState: null }))).toBe("Salvador");
  });
});

describe("sellerNames", () => {
  it("lista os vendedores que atendem o cliente", () => {
    const row = client({
      companyClient: {
        ...client().companyClient!,
        sellers: [
          { id: "s1", name: "Rafael" },
          { id: "s2", name: "Michael" },
        ],
      },
    });
    expect(sellerNames(row)).toBe("Rafael, Michael");
  });

  it("cliente sem vínculo na carteira devolve traço", () => {
    expect(sellerNames(client({ companyClient: null }))).toBe("—");
  });
});

describe("scoreLabel", () => {
  it("arredonda o score para inteiro", () => {
    expect(scoreLabel(client())).toBe("62");
  });

  it("sem score devolve traço", () => {
    expect(
      scoreLabel(
        client({
          companyClient: { ...client().companyClient!, visitScoreTotal: null },
        })
      )
    ).toBe("—");
  });
});

describe("buildClientsExportRows", () => {
  it("grava os dias sem comprar como NÚMERO, para ordenar a planilha", () => {
    const [row] = buildClientsExportRows([client()]);
    expect(typeof row[8]).toBe("number");
  });

  it("deixa a coluna de dias VAZIA para quem nunca comprou", () => {
    // Zero seria lido como "comprou hoje" ao ordenar a planilha.
    const [row] = buildClientsExportRows([
      client({
        companyClient: { ...client().companyClient!, lastOrderDate: null },
      }),
    ]);
    expect(row[8]).toBe("");
    expect(row[7]).toBe("nunca comprou");
  });

  it("escreve o CNPJ com máscara", () => {
    const [row] = buildClientsExportRows([client()]);
    expect(row[2]).toBe("12.345.678/0001-99");
  });

  it("traz rede e segmento, com traço quando não há", () => {
    const [comClassificacao] = buildClientsExportRows([client()]);
    expect(comClassificacao[4]).toBe("Rede Boa Compra");
    expect(comClassificacao[5]).toBe("Colchoaria");

    const [sem] = buildClientsExportRows([
      client({
        companyClient: {
          ...client().companyClient!,
          network: null,
          segment: null,
        },
      }),
    ]);
    expect(sem[4]).toBe("—");
    expect(sem[5]).toBe("—");
  });
});
