import { describe, expect, it } from "vitest";
import { OrderCartItem } from "./interface";
import {
  sentOrderRedirect,
  cartEstimate,
  cartEstimatedTotal,
  cartStorageKey,
  fitToMultiple,
  isAtMinimumPack,
  catalogPageCount,
  lastPriceText,
  lineEstimateText,
  priceWithTaxText,
  minimumPackText,
  orderHref,
  orderRequestFields,
  packCountText,
  packPriceText,
  parseCatalogSearch,
  parseFactoryParam,
  parseStoredCart,
  productCountLabel,
  quantityError,
  resolveOrderFactory,
  selectedFactoryName,
  stepQuantity,
  toCartItem,
} from "./utils";

const cartItem = (overrides: Partial<OrderCartItem> = {}): OrderCartItem => ({
  productId: "p1",
  productName: "Torneira",
  sku: null,
  factoryName: "Alfa",
  saleMultiple: null,
  estimatedUnitPrice: "10.00",
  quantity: "2",
  ...overrides,
});

describe("parseCatalogSearch", () => {
  it("apara e devolve nulo quando vazio", () => {
    expect(parseCatalogSearch("  torneira ")).toBe("torneira");
    expect(parseCatalogSearch("   ")).toBeNull();
    expect(parseCatalogSearch(undefined)).toBeNull();
  });

  it("usa o primeiro valor repetido e corta em 80 caracteres", () => {
    expect(parseCatalogSearch(["a", "b"])).toBe("a");
    expect(parseCatalogSearch("x".repeat(100))).toHaveLength(80);
  });
});

describe("orderHref", () => {
  it("mantém a busca, omite a página 1 e volta na lista de produtos", () => {
    expect(orderHref("tok", null, 1)).toBe("/p/tok/pedido#todos-os-produtos");
    expect(orderHref("tok", "sifão", 3)).toBe(
      "/p/tok/pedido?q=sif%C3%A3o&p=3#todos-os-produtos"
    );
  });

  it("guarda a fábrica escolhida", () => {
    expect(orderHref("tok", "sifão", 2, "fab-1")).toBe(
      "/p/tok/pedido?q=sif%C3%A3o&f=fab-1&p=2#todos-os-produtos"
    );
  });
});

describe("parseFactoryParam", () => {
  it("apara, pega o primeiro e devolve nulo quando vazio", () => {
    expect(parseFactoryParam(" fab-1 ")).toBe("fab-1");
    expect(parseFactoryParam(["fab-1", "fab-2"])).toBe("fab-1");
    expect(parseFactoryParam("")).toBeNull();
    expect(parseFactoryParam(undefined)).toBeNull();
  });
});

describe("orderRequestFields", () => {
  it("manda só o recado aparado — desconto o cliente não pede mais", () => {
    const form = new FormData();
    form.set("discountPercent", "5");
    form.set("note", "  até sexta ");
    expect(orderRequestFields(form)).toEqual({ note: "até sexta" });
  });

  it("recado vazio não vai", () => {
    const form = new FormData();
    form.set("note", "   ");
    expect(orderRequestFields(form)).toEqual({});
  });
});

describe("catalogPageCount", () => {
  it("arredonda para cima e dá zero sem produtos", () => {
    expect(catalogPageCount({ total: 31, pageSize: 30 })).toBe(2);
    expect(catalogPageCount({ total: 30, pageSize: 30 })).toBe(1);
    expect(catalogPageCount({ total: 0, pageSize: 30 })).toBe(0);
  });
});

describe("toCartItem", () => {
  it("entra com a quantidade sugerida, sem as casas do Decimal", () => {
    const item = toCartItem({
      productId: "p1",
      productName: "Torneira",
      sku: "T-1",
      factoryName: "Alfa",
      saleMultiple: "12.0000",
      suggestedQuantity: "24.0000",
    });
    expect(item.quantity).toBe("24");
    expect(item.estimatedUnitPrice).toBeNull();
    expect(item.lastUnitPrice).toBeNull();
  });

  it("leva o preço da última compra para a lista", () => {
    const item = toCartItem({
      productId: "p1",
      productName: "Torneira",
      sku: null,
      factoryName: "Alfa",
      saleMultiple: null,
      suggestedQuantity: "1.0000",
      estimatedUnitPrice: "10.00",
      lastUnitPrice: "9.50",
    });
    expect(item.lastUnitPrice).toBe("9.50");
  });

  it("sugestão zerada ou ilegível vira 1", () => {
    const base = {
      productId: "p1",
      productName: "T",
      sku: null,
      factoryName: "A",
      saleMultiple: null,
    };
    expect(toCartItem({ ...base, suggestedQuantity: "0" }).quantity).toBe("1");
    expect(toCartItem({ ...base, suggestedQuantity: "abc" }).quantity).toBe(
      "1"
    );
  });

  it("encaixa na embalagem mínima e leva a foto", () => {
    const base = {
      productId: "p1",
      productName: "T",
      sku: null,
      factoryName: "A",
      saleMultiple: "12.0000",
      imageUrl: "products/p1.jpg",
    };
    // Última compra de 15 com caixa de 12: entra 24, nunca 15.
    const item = toCartItem({ ...base, suggestedQuantity: "15" });
    expect(item.quantity).toBe("24");
    expect(item.imageUrl).toBe("products/p1.jpg");
    // Sem sugestão: a própria embalagem.
    expect(toCartItem({ ...base, suggestedQuantity: "0" }).quantity).toBe("12");
  });
});

describe("embalagem mínima", () => {
  it("fitToMultiple arredonda para cima e respeita venda livre", () => {
    expect(fitToMultiple(13, 12)).toBe(24);
    expect(fitToMultiple(24, 12)).toBe(24);
    expect(fitToMultiple(7, null)).toBe(7);
    expect(fitToMultiple(0.4, 0.5)).toBe(0.5);
  });

  it("quantityError explica com as duas saídas", () => {
    expect(quantityError({ quantity: "24", saleMultiple: "12" })).toBeNull();
    expect(quantityError({ quantity: "", saleMultiple: "12" })).toBe(
      "Informe a quantidade."
    );
    expect(quantityError({ quantity: "0", saleMultiple: null })).toBe(
      "Informe a quantidade."
    );
    expect(quantityError({ quantity: "15", saleMultiple: "12" })).toBe(
      "A fábrica vende de 12 em 12. Use 12 ou 24."
    );
    expect(quantityError({ quantity: "5", saleMultiple: "12" })).toBe(
      "A fábrica vende de 12 em 12. Use 12."
    );
    expect(quantityError({ quantity: "7", saleMultiple: null })).toBeNull();
  });
});

describe("parseStoredCart", () => {
  it("devolve só os itens bem formados", () => {
    const raw = JSON.stringify([cartItem(), { productId: 3 }, null]);
    expect(parseStoredCart(raw)).toEqual([cartItem()]);
  });

  it("JSON quebrado, vazio ou não-lista vira lista vazia", () => {
    expect(parseStoredCart("{quebrado")).toEqual([]);
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart('{"a":1}')).toEqual([]);
  });
});

describe("cartEstimatedTotal", () => {
  it("soma quantidade × preço", () => {
    expect(
      cartEstimatedTotal([
        cartItem(),
        cartItem({ productId: "p2", quantity: "1,5", estimatedUnitPrice: "4" }),
      ])
    ).toBe(26);
  });

  it("um produto sem preço esconde o total", () => {
    expect(
      cartEstimatedTotal([cartItem(), cartItem({ estimatedUnitPrice: null })])
    ).toBeNull();
    expect(cartEstimatedTotal([])).toBeNull();
  });
});

describe("productCountLabel", () => {
  it("singular e plural", () => {
    expect(productCountLabel(1)).toBe("1 produto");
    expect(productCountLabel(3)).toBe("3 produtos");
  });
});

describe("resolveOrderFactory", () => {
  const factories = [
    { factoryId: "a", name: "Fábrica Alfa" },
    { factoryId: "b", name: "Fábrica Beta" },
  ];

  it("usa a fábrica escolhida quando ela atende o cliente", () => {
    expect(resolveOrderFactory("b", factories)).toBe("b");
  });

  it("sem escolha, com várias fábricas, falta escolher — não há 'todas'", () => {
    expect(resolveOrderFactory(null, factories)).toBeNull();
  });

  it("fábrica da URL que não atende o cliente não vale", () => {
    expect(resolveOrderFactory("zzz", factories)).toBeNull();
  });

  it("com uma fábrica só, é ela", () => {
    expect(resolveOrderFactory(null, [factories[0]])).toBe("a");
  });
});

describe("selectedFactoryName", () => {
  const factories = [
    { factoryId: "a", name: "Fábrica Alfa" },
    { factoryId: "b", name: "Fábrica Beta" },
  ];

  it("mostra a fábrica escolhida", () => {
    expect(selectedFactoryName("b", factories)).toBe("Fábrica Beta");
  });

  it("sem escolha, é nulo (a tela pede para escolher)", () => {
    expect(selectedFactoryName(null, factories)).toBeNull();
  });

  it("com uma fábrica só, mostra ela mesma", () => {
    expect(selectedFactoryName(null, [factories[0]])).toBe("Fábrica Alfa");
  });
});

describe("lastPriceText", () => {
  it("diz o preço da última compra por unidade", () => {
    expect(lastPriceText("9.5")).toMatch(/^Última compra: R\$\s9,50 \/ un\.$/);
  });

  it("nunca comprou: nada a dizer", () => {
    expect(lastPriceText(null)).toBeNull();
    expect(lastPriceText(undefined)).toBeNull();
  });
});

describe("cartStorageKey", () => {
  it("uma lista por fábrica", () => {
    expect(cartStorageKey("t", "a")).not.toBe(cartStorageKey("t", "b"));
  });
});

describe("lineEstimateText", () => {
  it("escreve a conta da linha por extenso", () => {
    expect(
      lineEstimateText(cartItem({ quantity: "12", estimatedUnitPrice: "9.9" }))
    ).toMatch(/^12 × R\$\s9,90 = R\$\s118,80$/);
  });

  it("some sem preço ou sem quantidade", () => {
    expect(lineEstimateText(cartItem({ estimatedUnitPrice: null }))).toBeNull();
    expect(
      lineEstimateText(cartItem({ quantity: "", estimatedUnitPrice: "9.9" }))
    ).toBeNull();
  });
});

describe("embalagem mínima", () => {
  it("diz a embalagem por extenso; sem múltiplo é avulso", () => {
    expect(minimumPackText("12.0000")).toBe("12 unidades");
    expect(minimumPackText(null)).toBe("1 unidade");
    expect(minimumPackText("1")).toBe("1 unidade");
  });

  it("preço da embalagem só quando há embalagem e preço", () => {
    expect(packPriceText("12.0000", "9.90")).toBe("R$\u00a0118,80 a embalagem");
    expect(packPriceText(null, "9.90")).toBeNull();
    expect(packPriceText("12", null)).toBeNull();
  });

  it("conta as embalagens só quando a quantidade fecha", () => {
    expect(packCountText({ quantity: "12", saleMultiple: "12" })).toBe(
      "1 embalagem de 12 un."
    );
    expect(packCountText({ quantity: "24", saleMultiple: "12" })).toBe(
      "2 embalagens de 12 un. = 24 unidades"
    );
    expect(packCountText({ quantity: "15", saleMultiple: "12" })).toBeNull();
    expect(packCountText({ quantity: "3", saleMultiple: null })).toBeNull();
  });

  it("− e + andam uma embalagem e fecham a embalagem", () => {
    expect(stepQuantity("12", "12", 1)).toBe("24");
    expect(stepQuantity("24", "12", -1)).toBe("12");
    expect(stepQuantity("15", "12", 1)).toBe("24");
    expect(stepQuantity("15", "12", -1)).toBe("12");
    expect(stepQuantity("12", "12", -1)).toBe("12");
    expect(stepQuantity("", "12", 1)).toBe("12");
    expect(stepQuantity("3", null, 1)).toBe("4");
  });

  it("no mínimo, o − fica desligado", () => {
    expect(isAtMinimumPack("12", "12")).toBe(true);
    expect(isAtMinimumPack("24", "12")).toBe(false);
    expect(isAtMinimumPack("", "12")).toBe(true);
  });
});

describe("sentOrderRedirect", () => {
  it("um pedido criado abre a tela dele, confirmando o envio", () => {
    expect(sentOrderRedirect("tok", ["ord-1"])).toBe(
      "/p/tok/enviados/ord-1?enviado=1"
    );
  });

  it("vários (uma fábrica cada) ou nenhum id vão para a lista", () => {
    expect(sentOrderRedirect("tok", ["a", "b"])).toBe(
      "/p/tok/enviados?enviado=1"
    );
    expect(sentOrderRedirect("tok", [])).toBe("/p/tok/enviados?enviado=1");
  });
});

describe("cartEstimate", () => {
  it("separa mercadoria e imposto pelo preço com imposto", () => {
    expect(
      cartEstimate([
        cartItem({ quantity: "2", estimatedUnitPriceWithTax: "11.00" }),
        cartItem({
          productId: "p2",
          quantity: "1",
          estimatedUnitPrice: "5",
          estimatedUnitPriceWithTax: "5",
        }),
      ])
    ).toEqual({ goods: 25, tax: 2, total: 27 });
  });

  it("lista guardada sem o preço com imposto: imposto nulo, total é a mercadoria", () => {
    expect(cartEstimate([cartItem({ quantity: "3" })])).toEqual({
      goods: 30,
      tax: null,
      total: 30,
    });
  });

  it("o total do badge já leva o imposto", () => {
    expect(
      cartEstimatedTotal([
        cartItem({ quantity: "2", estimatedUnitPriceWithTax: "11.00" }),
      ])
    ).toBe(22);
  });
});

describe("priceWithTaxText", () => {
  it("mostra o preço com imposto quando ele é maior", () => {
    expect(priceWithTaxText("10.00", "10.45")).toMatch(
      /^Com impostos: R\$\s10,45 \/ un\.$/
    );
  });

  it("some sem imposto ou sem preço", () => {
    expect(priceWithTaxText("10.00", "10.00")).toBeNull();
    expect(priceWithTaxText(null, "10.45")).toBeNull();
    expect(priceWithTaxText("10.00", null)).toBeNull();
  });
});
