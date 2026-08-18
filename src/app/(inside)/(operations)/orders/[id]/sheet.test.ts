import { describe, expect, it } from "vitest";

import { OrderDetail, OrderItem } from "./interface";
import { buildOrderSheetRows } from "./sheet";

const item = (overrides: Partial<OrderItem> = {}): OrderItem =>
  ({
    id: "i1",
    quantity: "2",
    unitsTotal: "24",
    unitPrice: "10",
    discount: "0",
    subtotal: "240",
    ipiRate: "0",
    ipiAmount: "0",
    taxAmount: "10",
    unitPriceWithTax: "10.41",
    isPromo: false,
    createdAt: "2026-05-10T12:00:00Z",
    source: "MANUAL",
    product: {
      id: "p1",
      name: "Camiseta Básica",
      sku: "SKU-1",
      saleMultiple: "12",
      unitPerPack: "12",
      taxes: [],
    },
    tier: { id: "t1", name: "Nível 2" },
    ...overrides,
  }) as OrderItem;

const order = (overrides: Partial<OrderDetail> = {}): OrderDetail =>
  ({
    id: "abc12345-0000-0000-0000-000000000000",
    orderDate: "2026-05-10",
    totalAmount: "240",
    ipiAmount: "20",
    taxAmount: "10",
    ipiInOrder: true,
    commissionAmount: "12",
    status: "CONFIRMED",
    fileUrl: null,
    isFileParsed: false,
    notes: null,
    freightType: null,
    createdAt: "2026-05-10T12:00:00Z",
    invoicedAt: null,
    deliveredAt: null,
    deliveryEstimateDays: null,
    estimatedDeliveryDate: null,
    isDeliveryOverdue: false,
    paymentTermId: null,
    commissionCalcBasis: null,
    parentOrderId: null,
    isBackorder: false,
    parentOrder: null,
    backorderChildren: [],
    seller: { id: "s1", name: "Ana" },
    client: {
      id: "c1",
      razaoSocial: "Bom Preço Comércio LTDA",
      nomeFantasia: "Mercado Bom Preço",
      cnpj: "12345678000190",
      addressCity: "Salvador",
      addressState: "BA",
    },
    factory: {
      id: "f1",
      razaoSocial: "Delta Indústria SA",
      nomeFantasia: "Delta",
      nickname: null,
      logoUrl: null,
    },
    paymentTerm: null,
    availablePaymentTerms: [],
    installments: [],
    ...overrides,
  }) as OrderDetail;

const findRow = (rows: string[][], label: string) =>
  rows.find((row) => row[0] === label);

describe("buildOrderSheetRows", () => {
  it("abre com a ficha do negócio e o número do pedido", () => {
    const rows = buildOrderSheetRows(order(), [item()]);
    expect(rows[0]).toEqual(["Pedido", "ABC12345"]);
    expect(findRow(rows, "Cliente")?.[1]).toBe("Bom Preço Comércio LTDA");
    expect(findRow(rows, "CNPJ")?.[1]).toBe("12.345.678/0001-90");
    expect(findRow(rows, "Cidade / UF")?.[1]).toBe("Salvador / BA");
  });

  it("chama de orçamento o que ainda não virou pedido", () => {
    const rows = buildOrderSheetRows(order({ status: "SENT" }), []);
    expect(rows[0][0]).toBe("Orçamento");
    expect(findRow(rows, "Situação")?.[1]).toBe("Orçamento enviado");
  });

  it("soma o imposto no subtotal da linha, como a tela e o PDF", () => {
    const rows = buildOrderSheetRows(order(), [item()]);
    const itemRow = rows.find((row) => row[0] === "SKU-1");
    // 240 de subtotal + 10 de imposto embutido.
    expect(itemRow?.[itemRow.length - 1]).toBe("250,00");
  });

  it("fecha com subtotal COM imposto e total COM IPI por fora", () => {
    const rows = buildOrderSheetRows(order(), [item()]);
    expect(findRow(rows, "Subtotal (R$)")?.[1]).toBe("250,00");
    expect(findRow(rows, "IPI (R$)")?.[1]).toBe("20,00");
    expect(findRow(rows, "Total (R$)")?.[1]).toBe("270,00");
  });

  it("só escreve o bloco de parcelas quando existem", () => {
    expect(
      findRow(buildOrderSheetRows(order(), []), "Parcelas")
    ).toBeUndefined();

    const withInstallments = buildOrderSheetRows(
      order({
        installments: [
          {
            id: "n1",
            sequence: 1,
            amount: "270",
            commissionAmount: "12",
            dueDate: "2026-06-10",
            status: "PENDING",
            paidAt: null,
            isOverdue: false,
            defaultedAt: null,
            isCommissionReceived: false,
            commissionReceivedAt: null,
            isSellerCommissionPaid: false,
            sellerCommissionPaidAt: null,
            sellerChargebackMonth: null,
          },
        ],
      }),
      []
    );
    expect(findRow(withInstallments, "Parcelas")).toBeDefined();
    expect(withInstallments.at(-1)).toEqual([
      "1",
      "10/06/2026",
      "270,00",
      "12,00",
      "Pendente",
    ]);
  });
});
