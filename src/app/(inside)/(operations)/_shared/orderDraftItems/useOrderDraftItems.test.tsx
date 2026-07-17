import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  ORDER_ITEM_COMPANY_FACTORIES_QUERY,
  ORDER_ITEM_LINKED_TIER_QUERY,
  ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
  ORDER_ITEM_PRICE_LISTS_QUERY,
  ORDER_ITEM_PRODUCTS_QUERY,
  ORDER_ITEM_TIERS_QUERY,
} from "../orderItemCatalog";
import { useOrderDraftItems } from "./useOrderDraftItems";

// Níveis são uma query simples (cabem numa página) → sem `after`.
const byCF = {
  first: 1000,
  filters: [{ field: "company_factory_id", operator: "eq", value: "cf-1" }],
};

// Produtos passam por `useAllPages`, que manda `after` explícito (null na 1ª).
const byCFPaged = { ...byCF, after: null };

const itemsInput = (after: string | null) => ({
  first: 1000,
  filters: [{ field: "price_list_id", operator: "eq", value: "pl-1" }],
  after,
});

const lastPage = { hasNextPage: false, endCursor: null };

const ipiTax = (rate: string) => [
  {
    id: `tax-${rate}`,
    rate,
    calcType: "RATE",
    taxRule: { id: "rule-ipi", name: "IPI" },
  },
];

// prod-1: embalagem de 5 peças, múltiplo de 2 embalagens (= 10 peças), IPI 3,25%.
// prod-2: peça avulsa, sem múltiplo e sem IPI.
const PRODUCTS = [
  {
    id: "prod-1",
    name: "Produto 1",
    sku: "S1",
    saleMultiple: "2",
    unitPerPack: "5.0000",
    unit: { id: "u1", label: "Peça" },
    taxes: ipiTax("3.2500"),
  },
  {
    id: "prod-2",
    name: "Produto 2",
    sku: "S2",
    saleMultiple: null,
    unitPerPack: "1.0000",
    unit: { id: "u1", label: "Peça" },
    taxes: [],
  },
];

const priceItem = (
  id: string,
  productId: string,
  tierId: string,
  unitPrice: string
) => ({
  node: {
    id,
    unitPrice,
    product: PRODUCTS.find((p) => p.id === productId)!,
    tier: { id: tierId, name: tierId === "tier-1" ? "Varejo" : "Atacado" },
  },
});

const catalogMocks: MockLink.MockedResponse[] = [
  {
    request: {
      query: ORDER_ITEM_COMPANY_FACTORIES_QUERY,
      variables: { input: { first: 200 } },
    },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {
      data: {
        companyFactories: {
          edges: [
            { node: { id: "cf-1", factoryId: "fac-1", ipiInOrder: true } },
          ],
        },
      },
    },
  },
  {
    request: {
      query: ORDER_ITEM_PRODUCTS_QUERY,
      variables: { input: byCFPaged },
    },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {
      data: {
        products: {
          edges: PRODUCTS.map((node) => ({ node })),
          pageInfo: lastPage,
        },
      },
    },
  },
  {
    request: { query: ORDER_ITEM_TIERS_QUERY, variables: { input: byCF } },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {
      data: {
        priceTiers: {
          edges: [
            { node: { id: "tier-1", name: "Varejo" } },
            { node: { id: "tier-2", name: "Atacado" } },
          ],
        },
      },
    },
  },
  {
    request: {
      query: ORDER_ITEM_PRICE_LISTS_QUERY,
      variables: {
        input: {
          first: 100,
          filters: [
            { field: "company_factory_id", operator: "eq", value: "cf-1" },
          ],
        },
      },
    },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {
      data: {
        factoryPriceLists: {
          edges: [
            {
              node: {
                id: "pl-1",
                name: "L1",
                isActive: true,
                validFrom: "2026-01-01",
                validUntil: null,
              },
            },
          ],
        },
      },
    },
  },
  // A tabela de preço vem em DUAS páginas, como numa fábrica real (1728 linhas
  // com first=1000). O preço de prod-2 só existe na 2ª página: se a varredura
  // parar na 1ª, ele fica sem preço — foi exatamente o bug de produção.
  {
    request: {
      query: ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
      variables: { input: itemsInput(null) },
    },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {
      data: {
        priceListItems: {
          // Preço da EMBALAGEM na tabela; o pedido divide por unitPerPack.
          edges: [
            priceItem("pli-1", "prod-1", "tier-1", "32.5000"), // → 6,50/un
            priceItem("pli-2", "prod-1", "tier-2", "30.0000"), // → 6,00/un
          ],
          pageInfo: { hasNextPage: true, endCursor: "cursor-p1" },
        },
      },
    },
  },
  {
    request: {
      query: ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
      variables: { input: itemsInput("cursor-p1") },
    },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {
      data: {
        priceListItems: {
          edges: [
            priceItem("pli-3", "prod-2", "tier-1", "10.0000"), // → 10,00/un
            priceItem("pli-4", "prod-2", "tier-2", "9.0000"), // → 9,00/un
          ],
          pageInfo: lastPage,
        },
      },
    },
  },
];

// Vínculo do cliente com a fábrica: nível acordado = Atacado.
const linkedTierMock: MockLink.MockedResponse = {
  request: {
    query: ORDER_ITEM_LINKED_TIER_QUERY,
    variables: {
      input: {
        first: 1,
        filters: [
          { field: "client_id", operator: "eq", value: "cli-1" },
          { field: "factory_id", operator: "eq", value: "fac-1" },
        ],
      },
    },
  },
  maxUsageCount: Number.POSITIVE_INFINITY,
  result: {
    data: {
      sellerClientFactoryList: {
        edges: [{ node: { id: "scf-1", priceTierId: "tier-2" } }],
      },
    },
  },
};

const makeWrapper = (mocks: MockLink.MockedResponse[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );
  Wrapper.displayName = "MockedCatalogWrapper";
  return Wrapper;
};

const wrapper = makeWrapper(catalogMocks);
const wrapperWithLink = makeWrapper([...catalogMocks, linkedTierMock]);

const selectProd1 = (r: { current: ReturnType<typeof useOrderDraftItems> }) =>
  act(() =>
    r.current.selectProduct({ value: "prod-1", label: "S1 — Produto 1" })
  );
const selectProd2 = (r: { current: ReturnType<typeof useOrderDraftItems> }) =>
  act(() =>
    r.current.selectProduct({ value: "prod-2", label: "S2 — Produto 2" })
  );

const renderDraft = (clientId?: string) =>
  renderHook(() => useOrderDraftItems(true, "fac-1", clientId), {
    wrapper: clientId ? wrapperWithLink : wrapper,
  });

describe("useOrderDraftItems", () => {
  it("sugere o preço POR UNIDADE da tabela ao escolher produto e nível", async () => {
    const { result } = renderDraft();
    await waitFor(() => expect(result.current.productOptions.length).toBe(2));

    selectProd1(result);
    act(() => result.current.selectTier({ value: "tier-1", label: "Varejo" }));

    // 32,50 (embalagem) ÷ 5 (unitPerPack) = 6,50 por unidade
    await waitFor(() => expect(result.current.unitPrice).toContain("6,50"));
    expect(result.current.unitName).toBe("Peça");
    expect(result.current.saleMultiple).toBe(10); // 2 embalagens × 5 unidades
  });

  it("usa o nível do vínculo do cliente e já traz o preço ao escolher o produto", async () => {
    const { result } = renderDraft("cli-1");
    await waitFor(() => expect(result.current.productOptions.length).toBe(2));

    // Sem tocar no nível: o vínculo diz Atacado → 30,00 ÷ 5 = 6,00.
    selectProd1(result);
    await waitFor(() =>
      expect(result.current.selectedTier?.value).toBe("tier-2")
    );
    await waitFor(() => expect(result.current.unitPrice).toContain("6,00"));
  });

  it("mantém o nível do item anterior no item seguinte", async () => {
    const { result } = renderDraft();
    await waitFor(() => expect(result.current.productOptions.length).toBe(2));

    selectProd1(result);
    act(() => result.current.selectTier({ value: "tier-2", label: "Atacado" }));
    await waitFor(() => expect(result.current.unitPrice).toContain("6,00"));
    act(() => result.current.setQuantity("20"));
    act(() => result.current.submitItem());
    expect(result.current.items).toHaveLength(1);

    // Produto novo, sem tocar no nível: segue em Atacado → 9,00.
    selectProd2(result);
    await waitFor(() =>
      expect(result.current.selectedTier?.value).toBe("tier-2")
    );
    await waitFor(() => expect(result.current.unitPrice).toContain("9,00"));
  });

  it("traz a alíquota de IPI vinculada ao produto e zera em produto sem IPI", async () => {
    const { result } = renderDraft("cli-1");
    await waitFor(() => expect(result.current.productOptions.length).toBe(2));

    selectProd1(result);
    await waitFor(() => expect(result.current.ipiRate).toBe("3.25"));

    // prod-2 não tem IPI: o campo não pode herdar o 3,25 do anterior.
    selectProd2(result);
    await waitFor(() => expect(result.current.ipiRate).toBe(""));
  });

  it("adiciona e remove itens do rascunho", async () => {
    const { result } = renderDraft();
    await waitFor(() => expect(result.current.productOptions.length).toBe(2));

    selectProd1(result);
    act(() => result.current.selectTier({ value: "tier-1", label: "Varejo" }));
    await waitFor(() => expect(result.current.unitPrice).toContain("6,50"));

    act(() => result.current.setQuantity("20")); // múltiplo de 10 unidades → ok
    act(() => result.current.submitItem());

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      productId: "prod-1",
      tierId: "tier-1",
      unitPrice: 6.5,
      quantity: 20,
      ipiRate: 3.25,
    });
    // o formulário de novo item é limpo após adicionar
    expect(result.current.unitPrice).toBe("");

    act(() => result.current.removeItem(0));
    expect(result.current.items).toHaveLength(0);
  });

  it("valida quantidade e múltiplo de venda antes de adicionar", async () => {
    const { result } = renderDraft();
    await waitFor(() => expect(result.current.productOptions.length).toBe(2));

    // sem produto
    act(() => result.current.submitItem());
    expect(result.current.error).toMatch(/produto/i);
    expect(result.current.items).toHaveLength(0);

    selectProd1(result);
    act(() => result.current.selectTier({ value: "tier-1", label: "Varejo" }));
    await waitFor(() => expect(result.current.unitPrice).toContain("6,50"));

    // quantidade 3 não é múltiplo de 10 unidades (2 embalagens × 5)
    act(() => result.current.setQuantity("3"));
    act(() => result.current.submitItem());
    expect(result.current.error).toMatch(/múltiplos de 10 unidade/i);
    expect(result.current.items).toHaveLength(0);
  });

  it("recusa o mesmo produto duas vezes no pedido", async () => {
    const { result } = renderDraft();
    await waitFor(() => expect(result.current.productOptions.length).toBe(2));

    selectProd1(result);
    act(() => result.current.selectTier({ value: "tier-1", label: "Varejo" }));
    await waitFor(() => expect(result.current.unitPrice).toContain("6,50"));
    act(() => result.current.setQuantity("20"));
    act(() => result.current.submitItem());
    expect(result.current.items).toHaveLength(1);

    // Mesmo produto de novo — mesmo em outro nível.
    selectProd1(result);
    act(() => result.current.selectTier({ value: "tier-2", label: "Atacado" }));
    await waitFor(() => expect(result.current.unitPrice).toContain("6,00"));
    act(() => result.current.setQuantity("10"));
    act(() => result.current.submitItem());

    expect(result.current.error).toMatch(/já está no pedido/i);
    expect(result.current.items).toHaveLength(1);
  });

  it("converte desconto em porcentagem para reais", async () => {
    const { result } = renderDraft();
    await waitFor(() => expect(result.current.productOptions.length).toBe(2));

    selectProd1(result);
    act(() => result.current.selectTier({ value: "tier-1", label: "Varejo" }));
    await waitFor(() => expect(result.current.unitPrice).toContain("6,50"));

    act(() => result.current.setQuantity("20")); // 20 × 6,50 = 130,00
    act(() =>
      result.current.selectDiscountType({ value: "PERCENT", label: "%" })
    );
    act(() => result.current.setDiscount("10"));
    act(() => result.current.submitItem());

    expect(result.current.items[0]).toMatchObject({
      discount: 13, // 10% de 130,00
      discountInput: 10,
      discountType: "PERCENT",
    });
  });

  it("edita um item já adicionado sem duplicá-lo", async () => {
    const { result } = renderDraft();
    await waitFor(() => expect(result.current.productOptions.length).toBe(2));

    selectProd1(result);
    act(() => result.current.selectTier({ value: "tier-1", label: "Varejo" }));
    await waitFor(() => expect(result.current.unitPrice).toContain("6,50"));
    act(() => result.current.setQuantity("20"));
    act(() => result.current.submitItem());

    // Reabre o item no formulário com os valores gravados.
    act(() => result.current.startEdit(0));
    expect(result.current.editingIndex).toBe(0);
    expect(result.current.quantity).toBe("20");
    expect(result.current.unitPrice).toContain("6,50");

    act(() => result.current.setQuantity("30"));
    act(() => result.current.submitItem());

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(30);
    expect(result.current.editingIndex).toBeNull();
  });
});
