import { describe, expect, it } from "vitest";

import { Client } from "../interface";
import { CLIENT_COLUMNS } from "./columns";

const client: Client = {
  id: "c1",
  cnpj: "12345678000190",
  razaoSocial: "Bom Preço Comércio LTDA",
  nomeFantasia: "Mercado Bom Preço",
  addressCity: "Salvador",
  addressState: "BA",
  isNeedsAttention: false,
  attentionReason: null,
  companyClient: {
    id: "cc1",
    visitScoreTotal: "72.4",
    lastOrderDate: "2026-05-10",
    lastInvoiceDate: "2026-05-18",
    lastVisitDate: null,
    sellers: [
      { id: "s1", name: "Ana" },
      { id: "s2", name: "Bruno" },
    ],
  },
};

const column = (header: string) =>
  CLIENT_COLUMNS.find((item) => item.header === header)!;

describe("CLIENT_COLUMNS", () => {
  it("tem as colunas da TELA, e nenhuma além delas", () => {
    // O papel é conferido contra a tabela: uma coluna a mais faz quem confere
    // procurar na tela um dado que não está lá. A data do último faturamento já
    // apareceu aqui por isso — a tabela não a mostra (só a planilha traz).
    expect(CLIENT_COLUMNS.map((column) => column.header)).toEqual([
      "CLIENTE",
      "CNPJ",
      "CIDADE / UF",
      "VENDEDOR",
      "ÚLT. COMPRA",
      "ÚLT. VISITA",
      "SCORE",
    ]);
  });

  it("mostra a razão social com o nome fantasia como segunda linha", () => {
    const cliente = column("CLIENTE");
    expect(cliente.value(client)).toBe("Bom Preço Comércio LTDA");
    expect(cliente.sub?.(client)).toBe("Mercado Bom Preço");
  });

  it("junta cidade e UF numa célula só", () => {
    expect(column("CIDADE / UF").value(client)).toBe("Salvador / BA");
  });

  it("marca com travessão o que o cadastro não tem", () => {
    const semVinculo = {
      ...client,
      companyClient: null,
      addressCity: null,
      addressState: null,
    };
    expect(column("CIDADE / UF").value(semVinculo)).toBe("—");
    expect(column("VENDEDOR").value(semVinculo)).toBe("—");
    expect(column("SCORE").value(semVinculo)).toBe("—");
    expect(column("ÚLT. VISITA").value(semVinculo)).toBe("—");
  });

  it("arredonda o score, que no papel é um número inteiro", () => {
    expect(column("SCORE").value(client)).toBe("72");
  });
});
