import { describe, expect, it } from "vitest";
import { PlaybookFactory, PlaybookOffer } from "./interface";
import { hasTalkingPoints, offerDetail, promoEndsLabel } from "./utils";

const offer = (patch: Partial<PlaybookOffer> = {}): PlaybookOffer => ({
  productId: "p1",
  status: "DUE",
  orderCount: 8,
  factoryOrderCount: 10,
  daysSinceLast: 40,
  lastUnits: "12.0000",
  isPromo: false,
  product: { id: "p1", name: "Argamassa" },
  ...patch,
});

const factory = (patch: Partial<PlaybookFactory> = {}): PlaybookFactory => ({
  sellerClientFactoryId: "l1",
  isFocus: true,
  isNegative: false,
  moreOffersCount: 0,
  factory: null,
  offers: [],
  promotion: null,
  portalRequest: null,
  ...patch,
});

describe("offerDetail", () => {
  it("diz quanto levou, quando, e o quanto o produto é de sempre", () => {
    expect(offerDetail(offer())).toBe(
      "Levou 12 un. há 40 dias · em 8 de 10 pedidos"
    );
  });

  // Com dois pedidos, "em 2 de 2" soa como hábito e não é.
  it("com poucos pedidos não afirma hábito", () => {
    expect(offerDetail(offer({ orderCount: 2, factoryOrderCount: 2 }))).toBe(
      "Levou 12 un. há 40 dias"
    );
  });
});

describe("promoEndsLabel", () => {
  it("conta o prazo como a pessoa fala", () => {
    expect(promoEndsLabel("2026-09-27", "2026-09-27")).toBe("Termina hoje");
    expect(promoEndsLabel("2026-09-28", "2026-09-27")).toBe("Termina amanhã");
    expect(promoEndsLabel("2026-10-02", "2026-09-27")).toBe("Até 02/10/2026");
  });

  it("virada de mês ainda é amanhã", () => {
    expect(promoEndsLabel("2026-10-01", "2026-09-30")).toBe("Termina amanhã");
  });
});

describe("hasTalkingPoints", () => {
  it("fábrica sem sugestão, promoção nem pedido do portal fica de fora", () => {
    expect(hasTalkingPoints(factory())).toBe(false);
  });

  it("qualquer um dos três já rende assunto", () => {
    expect(hasTalkingPoints(factory({ offers: [offer()] }))).toBe(true);
    expect(
      hasTalkingPoints(
        factory({ portalRequest: { orderId: "o1", requestedOn: "2026-09-25" } })
      )
    ).toBe(true);
  });

  it("negativada nunca: a fábrica não aceita pedido novo dele", () => {
    expect(
      hasTalkingPoints(factory({ isNegative: true, offers: [offer()] }))
    ).toBe(false);
  });
});
