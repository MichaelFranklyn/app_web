import { describe, expect, it } from "vitest";

import { Client } from "../../../interface";
import { EXPORT_HEADERS, buildExportRows } from "./utils";

const client: Client = {
  id: "c1",
  cnpj: "12345678000190",
  razaoSocial: "Bom Preço Comércio LTDA",
  nomeFantasia: "Mercado Bom Preço",
  cnae: "4711302",
  cnaeDescription: "Comércio varejista",
  addressCity: "Salvador",
  addressState: "BA",
  isNeedsAttention: false,
  attentionReason: null,
  companyClient: {
    id: "cc1",
    visitScoreTotal: "72.4",
    lastOrderDate: "2026-05-10",
    lastVisitDate: null,
    sellers: [
      { id: "s1", name: "Ana" },
      { id: "s2", name: "Bruno" },
    ],
  },
};

describe("buildExportRows", () => {
  it("gera uma linha por cliente, alinhada com os cabeçalhos", () => {
    const [row] = buildExportRows([client]);
    expect(row).toHaveLength(EXPORT_HEADERS.length);
    expect(row[0]).toBe("Bom Preço Comércio LTDA");
    expect(row[2]).toBe("12.345.678/0001-90");
    expect(row[7]).toBe("Ana, Bruno");
    expect(row[10]).toBe("72");
  });

  it("degrada campos ausentes para célula vazia", () => {
    const [row] = buildExportRows([
      { ...client, nomeFantasia: null, companyClient: null },
    ]);
    expect(row[1]).toBe("");
    expect(row[7]).toBe("");
    expect(row[10]).toBe("");
  });
});
