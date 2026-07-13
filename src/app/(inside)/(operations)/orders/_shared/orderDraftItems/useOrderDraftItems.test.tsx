import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  ORDER_ITEM_COMPANY_FACTORIES_QUERY,
  ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
  ORDER_ITEM_PRICE_LISTS_QUERY,
  ORDER_ITEM_PRODUCTS_QUERY,
  ORDER_ITEM_TIERS_QUERY,
} from "../orderItemCatalog";
import { useOrderDraftItems } from "./useOrderDraftItems";

const byCF = {
  first: 1000,
  filters: [{ field: "company_factory_id", operator: "eq", value: "cf-1" }],
};

const mocks: MockLink.MockedResponse[] = [
  {
    request: {
      query: ORDER_ITEM_COMPANY_FACTORIES_QUERY,
      variables: { input: { first: 200 } },
    },
    result: {
      data: {
        companyFactories: {
          edges: [{ node: { id: "cf-1", factoryId: "fac-1" } }],
        },
      },
    },
  },
  {
    request: { query: ORDER_ITEM_PRODUCTS_QUERY, variables: { input: byCF } },
    result: {
      data: {
        products: {
          edges: [
            {
              node: {
                id: "prod-1",
                name: "Produto 1",
                sku: "S1",
                saleMultiple: "2",
                unitLabel: { id: "u1", label: "Caixa" },
              },
            },
          ],
        },
      },
    },
  },
  {
    request: { query: ORDER_ITEM_TIERS_QUERY, variables: { input: byCF } },
    result: {
      data: {
        priceTiers: { edges: [{ node: { id: "tier-1", name: "Varejo" } }] },
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
  {
    request: {
      query: ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
      variables: {
        input: {
          first: 1000,
          filters: [{ field: "price_list_id", operator: "eq", value: "pl-1" }],
        },
      },
    },
    result: {
      data: {
        priceListItems: {
          edges: [
            {
              node: {
                id: "pli-1",
                unitPrice: "32.5000",
                product: {
                  id: "prod-1",
                  name: "Produto 1",
                  sku: "S1",
                  saleMultiple: "2",
                  unitLabel: { id: "u1", label: "Caixa" },
                },
                tier: { id: "tier-1", name: "Varejo" },
              },
            },
          ],
        },
      },
    },
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider mocks={mocks}>{children}</MockedProvider>
);

describe("useOrderDraftItems", () => {
  it("sugere o preço da tabela ao escolher produto e nível", async () => {
    const { result } = renderHook(() => useOrderDraftItems(true, "fac-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.productOptions.length).toBe(1));

    act(() =>
      result.current.selectProduct({ value: "prod-1", label: "S1 — Produto 1" })
    );
    act(() => result.current.selectTier({ value: "tier-1", label: "Varejo" }));

    await waitFor(() => expect(result.current.unitPrice).toContain("32,50"));
    // rótulo da embalagem e múltiplo de venda vêm do catálogo
    expect(result.current.packLabel).toBe("Caixa");
    expect(result.current.saleMultiple).toBe(2);
  });

  it("adiciona e remove itens do rascunho", async () => {
    const { result } = renderHook(() => useOrderDraftItems(true, "fac-1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.productOptions.length).toBe(1));

    act(() =>
      result.current.selectProduct({ value: "prod-1", label: "S1 — Produto 1" })
    );
    act(() => result.current.selectTier({ value: "tier-1", label: "Varejo" }));
    await waitFor(() => expect(result.current.unitPrice).toContain("32,50"));

    act(() => result.current.setQuantity("4")); // múltiplo de 2 → ok
    act(() => result.current.addItem());

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      productId: "prod-1",
      tierId: "tier-1",
      unitPrice: 32.5,
      quantity: 4,
    });
    // o formulário de novo item é limpo após adicionar
    expect(result.current.unitPrice).toBe("");

    act(() => result.current.removeItem(0));
    expect(result.current.items).toHaveLength(0);
  });

  it("valida quantidade e múltiplo de venda antes de adicionar", async () => {
    const { result } = renderHook(() => useOrderDraftItems(true, "fac-1"), {
      wrapper,
    });
    await waitFor(() => expect(result.current.productOptions.length).toBe(1));

    // sem produto
    act(() => result.current.addItem());
    expect(result.current.error).toMatch(/produto/i);
    expect(result.current.items).toHaveLength(0);

    act(() =>
      result.current.selectProduct({ value: "prod-1", label: "S1 — Produto 1" })
    );
    act(() => result.current.selectTier({ value: "tier-1", label: "Varejo" }));
    await waitFor(() => expect(result.current.unitPrice).toContain("32,50"));

    // quantidade 3 não é múltiplo de 2
    act(() => result.current.setQuantity("3"));
    act(() => result.current.addItem());
    expect(result.current.error).toMatch(/múltiplos de 2/i);
    expect(result.current.items).toHaveLength(0);
  });
});
