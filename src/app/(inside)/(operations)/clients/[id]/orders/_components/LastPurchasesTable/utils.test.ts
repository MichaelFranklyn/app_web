import { describe, expect, it } from "vitest";
import { ClientLastPurchase } from "./interface";
import {
  daysSince,
  groupPurchases,
  purchaseCountLabel,
  sinceLabel,
} from "./utils";

const purchase = (
  overrides: Partial<ClientLastPurchase> & {
    factoryId: string;
    sellerId: string;
  }
): ClientLastPurchase => ({
  factory: {
    id: overrides.factoryId,
    nickname: null,
    nomeFantasia: `Fábrica ${overrides.factoryId}`,
    razaoSocial: null,
  },
  seller: { id: overrides.sellerId, name: `Vendedor ${overrides.sellerId}` },
  lastOrderId: `${overrides.factoryId}-${overrides.sellerId}`,
  lastOrderDate: "2026-05-10",
  lastOrderAmount: "1000.00",
  lastOrderStatus: "DELIVERED",
  orderCount: 1,
  totalAmount: "1000.00",
  ...overrides,
});

// Como o backend manda: da compra mais recente à mais antiga.
const PURCHASES = [
  purchase({
    factoryId: "herc",
    sellerId: "bruno",
    lastOrderDate: "2026-07-01",
    orderCount: 2,
    totalAmount: "500.00",
  }),
  purchase({
    factoryId: "herc",
    sellerId: "ana",
    lastOrderDate: "2026-06-01",
    orderCount: 3,
    totalAmount: "1500.50",
  }),
  purchase({
    factoryId: "delta",
    sellerId: "ana",
    lastOrderDate: "2026-01-15",
  }),
];

describe("groupPurchases", () => {
  it("por fábrica: a compra mais recente diz com quem foi e as compras somam", () => {
    const rows = groupPurchases(PURCHASES, "factory");

    expect(rows.map((r) => r.name)).toEqual(["Fábrica herc", "Fábrica delta"]);
    expect(rows[0]).toMatchObject({
      counterpart: "Vendedor bruno",
      lastOrderId: "herc-bruno",
      lastOrderDate: "2026-07-01",
      orderCount: 5,
      totalAmount: 2000.5,
    });
  });

  it("por vendedor: a compra mais recente diz de qual fábrica foi", () => {
    const rows = groupPurchases(PURCHASES, "seller");

    expect(rows.map((r) => r.name)).toEqual(["Vendedor bruno", "Vendedor ana"]);
    expect(rows[1]).toMatchObject({
      counterpart: "Fábrica herc",
      lastOrderDate: "2026-06-01",
      orderCount: 4,
    });
  });

  it("usa o apelido da fábrica e cai em '—' sem vendedor", () => {
    const [row] = groupPurchases(
      [
        purchase({
          factoryId: "herc",
          sellerId: "x",
          factory: { id: "herc", nickname: "Herc", nomeFantasia: "Hercules" },
          seller: null,
        }),
      ],
      "factory"
    );

    expect(row.name).toBe("Herc");
    expect(row.counterpart).toBe("—");
  });

  it("lista vazia não quebra", () => {
    expect(groupPurchases([], "seller")).toEqual([]);
  });
});

describe("tempo desde a compra", () => {
  it("conta dias corridos entre datas ISO", () => {
    expect(daysSince("2026-10-30", "2026-11-06")).toBe(7);
    expect(daysSince("2026-02-28", "2026-03-01")).toBe(1);
  });

  it("escreve como a pessoa fala", () => {
    expect(sinceLabel("2026-11-06", "2026-11-06")).toBe("hoje");
    expect(sinceLabel("2026-11-05", "2026-11-06")).toBe("ontem");
    expect(sinceLabel("2026-10-30", "2026-11-06")).toBe("há 7 dias");
  });

  it("singular e plural de compras", () => {
    expect(purchaseCountLabel(1)).toBe("1 compra");
    expect(purchaseCountLabel(4)).toBe("4 compras");
  });
});
