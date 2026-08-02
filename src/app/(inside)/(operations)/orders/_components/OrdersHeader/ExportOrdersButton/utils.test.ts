import { describe, expect, it } from "vitest";

import { Order } from "../../../interface";
import { EXPORT_HEADERS, buildExportRows } from "./utils";

const order: Order = {
  id: "abc12345-0000-0000-0000-000000000000",
  orderDate: "2026-05-10",
  invoicedAt: "2026-05-18",
  totalAmount: "1234.5",
  commissionAmount: "61.73",
  status: "INVOICED",
  isDeliveryOverdue: false,
  seller: { id: "s1", name: "Ana" },
  client: {
    id: "c1",
    razaoSocial: "Bom Preço Comércio LTDA",
    nomeFantasia: "Mercado Bom Preço",
  },
  factory: {
    id: "f1",
    razaoSocial: "Delta Indústria SA",
    nomeFantasia: "Delta",
  },
};

const cell = (row: string[], header: string) =>
  row[EXPORT_HEADERS.indexOf(header)];

describe("buildExportRows", () => {
  it("gera uma linha por pedido, alinhada com os cabeçalhos", () => {
    const [row] = buildExportRows([order]);
    expect(row).toHaveLength(EXPORT_HEADERS.length);
    expect(cell(row, "Pedido")).toBe("ABC12345");
    expect(cell(row, "Data do pedido")).toBe("10/05/2026");
    expect(cell(row, "Cliente")).toBe("Bom Preço Comércio LTDA");
    expect(cell(row, "Fábrica")).toBe("Delta");
    expect(cell(row, "Situação")).toBe("Faturado");
  });

  it("escreve dinheiro no formato que o Excel pt-BR soma", () => {
    const [row] = buildExportRows([order]);
    // Sem "R$" e com vírgula decimal: célula numérica, não texto.
    expect(cell(row, "Valor total (R$)")).toBe("1.234,50");
    expect(cell(row, "Comissão (R$)")).toBe("61,73");
  });

  it("degrada vínculos ausentes para célula vazia, sem travessão", () => {
    const [row] = buildExportRows([
      { ...order, client: null, factory: null, seller: null, invoicedAt: null },
    ]);
    expect(cell(row, "Cliente")).toBe("");
    expect(cell(row, "Fábrica")).toBe("");
    expect(cell(row, "Vendedor")).toBe("");
    expect(cell(row, "Faturado em")).toBe("");
  });
});
