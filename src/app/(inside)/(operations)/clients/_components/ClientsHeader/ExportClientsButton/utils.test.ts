import { describe, expect, it } from "vitest";

import { Client } from "../../../interface";
import { EXPORT_HEADERS, buildExportRows } from "./utils";

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

const cell = (row: string[], header: string) =>
  row[EXPORT_HEADERS.indexOf(header)];

describe("buildExportRows", () => {
  it("gera uma linha por cliente, alinhada com os cabeçalhos", () => {
    const [row] = buildExportRows([client]);
    expect(row).toHaveLength(EXPORT_HEADERS.length);
    expect(cell(row, "Razão social")).toBe("Bom Preço Comércio LTDA");
    expect(cell(row, "CNPJ")).toBe("12.345.678/0001-90");
    expect(cell(row, "Vendedores")).toBe("Ana, Bruno");
    expect(cell(row, "Faturamento")).toBe("18/05/2026");
    expect(cell(row, "Score")).toBe("72");
  });

  it("não exporta CNAE nem ramo de atividade", () => {
    expect(EXPORT_HEADERS).not.toContain("CNAE");
    expect(EXPORT_HEADERS).not.toContain("Ramo de atividade");
  });

  it("degrada campos ausentes para célula vazia", () => {
    const [row] = buildExportRows([
      { ...client, nomeFantasia: null, companyClient: null },
    ]);
    // Empresa sem nome fantasia na Receita: a célula sai vazia, não inventada.
    expect(cell(row, "Nome fantasia")).toBe("");
    expect(cell(row, "Vendedores")).toBe("");
    expect(cell(row, "Score")).toBe("");
  });
});
