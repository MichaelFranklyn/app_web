import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  discardNote,
  PDF_OTHER_REASONS,
  PDF_WRONG_FIELDS,
  readFieldValue,
  wrongFieldsInput,
} from "./reasons";

const schema = readFileSync("src/__generated__/schema.graphql", "utf8");

function enumValues(name: string): string[] {
  const body = schema.match(new RegExp(`enum ${name} \\{([^}]*)\\}`))?.[1];
  return (body ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[A-Z_]+$/.test(line))
    .sort();
}

describe("motivos de excluir PDF", () => {
  it("os motivos que não são campo existem no enum da API", () => {
    const values = enumValues("OrderPdfDiscardReason");
    for (const reason of PDF_OTHER_REASONS) {
      expect(values).toContain(reason.value);
    }
  });

  it("os campos são os mesmos do enum da API", () => {
    expect(PDF_WRONG_FIELDS.map((f) => f.value).sort()).toEqual(
      enumValues("OrderPdfField")
    );
  });

  it("só os itens não têm valor para digitar", () => {
    const withoutValue = PDF_WRONG_FIELDS.filter((f) => !f.placeholder);
    expect(withoutValue.map((f) => f.value)).toEqual(["ITEMS"]);
  });

  it("mostra o que o sistema leu, no formato da tela", () => {
    const file = {
      header: {
        clientDocument: "12345678000195",
        clientName: null,
        orderDate: "2026-11-13",
        orderNumber: "142032099",
        invoiceNumber: null,
        paymentTerms: "28/35/42",
        totals: { items: "1000.00", ipi: null, st: null, total: "1050.00" },
      },
      items: [
        { code: "1", name: "A", quantity: "1", unitPrice: "1", ipiRate: null },
      ],
    };
    expect(readFieldValue("CLIENT_DOCUMENT", file)).toBe("12.345.678/0001-95");
    expect(readFieldValue("ORDER_DATE", file)).toBe("13/11/2026");
    expect(readFieldValue("ORDER_TOTAL", file)?.replace(/\s/g, " ")).toBe(
      "R$ 1.050,00"
    );
    expect(readFieldValue("IPI_TOTAL", file)).toBeNull();
    expect(readFieldValue("ITEMS", file)).toBe("1 item");
    expect(readFieldValue("CLIENT_CODE", { header: null, items: null })).toBe(
      null
    );
  });

  it("valor em branco vai só como marca", () => {
    expect(wrongFieldsInput({ ORDER_TOTAL: " 1.500,00 ", ITEMS: "" })).toEqual([
      { field: "ITEMS", value: null },
      { field: "ORDER_TOTAL", value: "1.500,00" },
    ]);
  });

  it("texto em branco não vai à API", () => {
    expect(discardNote("   ")).toBeNull();
    expect(discardNote("  preço sem IPI ")).toBe("preço sem IPI");
  });
});
