import { FormBuilder } from "@/components/FormBuilder";
import { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ORDER_ITEM_COMPANY_FACTORIES_QUERY,
  ORDER_ITEM_PRICE_LIST_ITEMS_QUERY,
  ORDER_ITEM_PRICE_LISTS_QUERY,
  ORDER_ITEM_PRODUCTS_QUERY,
  ORDER_ITEM_TIERS_QUERY,
} from "../../../../../_shared/orderItemCatalog";
import { AddOrderItemModalProps, useAddOrderItem } from "./useAddOrderItem";

// Níveis são uma query simples (cabem numa página) → sem `after`.
const byCF = {
  first: 1000,
  filters: [{ field: "company_factory_id", operator: "eq", value: "cf-1" }],
};

// Produtos passam por `useAllPages`, que manda `after` explícito (null na 1ª).
const byCFPaged = { ...byCF, after: null };

const mocks: MockLink.MockedResponse[] = [
  {
    request: {
      query: ORDER_ITEM_COMPANY_FACTORIES_QUERY,
      variables: { input: { first: 200 } },
    },
    result: {
      data: {
        companyFactories: {
          edges: [
            { node: { id: "cf-1", factoryId: "fac-1", ipiInOrder: false } },
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
    result: {
      data: {
        products: {
          edges: [
            {
              node: {
                id: "prod-1",
                name: "Produto 1",
                sku: "S1",
                saleMultiple: null,
                unitPerPack: "5.0000",
                unit: { id: "u1", label: "Peça" },
                taxes: [],
              },
            },
            {
              // Fora da tabela de preço: nenhum nível tem preço para ele.
              node: {
                id: "prod-2",
                name: "Produto 2",
                sku: "S2",
                saleMultiple: null,
                unitPerPack: "1.0000",
                unit: { id: "u1", label: "Peça" },
                taxes: [],
              },
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
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
          after: null,
        },
      },
    },
    // Atraso: simula a última query da cadeia chegando DEPOIS de o vendedor já
    // ter escolhido produto e nível (a corrida que zerava o preço).
    delay: 60,
    result: {
      data: {
        priceListItems: {
          edges: [
            {
              node: {
                id: "pli-1",
                // Preço da EMBALAGEM na tabela; com unitPerPack 5, a sugestão
                // do pedido é 32,50 ÷ 5 = 6,50 por unidade.
                unitPrice: "32.5000",
                product: {
                  id: "prod-1",
                  name: "Produto 1",
                  sku: "S1",
                  saleMultiple: null,
                  unitPerPack: "5.0000",
                },
                tier: { id: "tier-1", name: "Varejo" },
              },
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    },
  },
];

// Captura a API do hook e renderiza um FormBuilder real ligado ao formRef
// interno — assim o `useEffect` que preenche o preço roda de verdade.
let api: ReturnType<typeof useAddOrderItem>;
function Harness(props: AddOrderItemModalProps) {
  api = useAddOrderItem(props);
  return (
    <FormBuilder
      ref={api.formRef}
      steps={api.steps}
      onSubmit={vi.fn()}
      unstyled
    />
  );
}

const findField = (name: string) =>
  api.steps[0].sections[0].fields.find((f) => f.name === name) as {
    name: string;
    options?: { value: string; label: string }[];
    onChange?: (
      v: unknown,
      setValue: (n: string, val: unknown) => void
    ) => void;
  };

describe("useAddOrderItem — sugestão de preço", () => {
  it("sugere o preço mesmo quando a tabela chega depois da seleção (corrida)", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <Harness
          orderId="o-1"
          factoryId="fac-1"
          onAdded={vi.fn()}
          onRefetch={vi.fn()}
        />
      </MockedProvider>
    );

    act(() => api.handleClose(true)); // abre o modal → dispara as queries

    // produtos e níveis já carregaram, mas os itens de preço ainda não (delay)
    await waitFor(() => {
      expect(findField("productId").options?.length).toBe(2);
      expect(findField("tierId").options?.length).toBe(1);
    });

    const setValue = api.formRef.current!.setValue;

    // vendedor escolhe produto e nível IMEDIATAMENTE, antes de priceListItems
    act(() => findField("productId").onChange!({ value: "prod-1" }, setValue));
    act(() => findField("tierId").onChange!({ value: "tier-1" }, setValue));

    // neste instante o preço ainda está vazio (tabela não chegou)
    expect(api.formRef.current!.getValues().unitPrice ?? "").not.toContain(
      "6,50"
    );

    // quando a tabela chega, o preço é sugerido reativamente
    await waitFor(() => {
      expect(api.formRef.current!.getValues().unitPrice).toContain("6,50");
    });
  });

  it("escolhe sozinho o único nível com preço do produto", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <Harness
          orderId="o-1"
          factoryId="fac-1"
          onAdded={vi.fn()}
          onRefetch={vi.fn()}
        />
      </MockedProvider>
    );

    act(() => api.handleClose(true));
    await waitFor(() => expect(findField("productId").options?.length).toBe(2));
    // espera a tabela carregar
    await new Promise((r) => setTimeout(r, 100));

    const setValue = api.formRef.current!.setValue;
    // Só o produto: prod-1 tem preço em um único nível, então o nível é
    // preenchido sozinho e o preço vem junto — sem o vendedor tocar no nível.
    act(() => findField("productId").onChange!({ value: "prod-1" }, setValue));

    await waitFor(() => {
      expect(api.formRef.current!.getValues().unitPrice).toContain("6,50");
    });
  });

  it("abre no nível do último item do pedido", async () => {
    // Cada abertura do modal é um item novo, então o nível "em uso" do wizard
    // não existe aqui — quem faz esse papel é o último item já gravado.
    render(
      <MockedProvider mocks={mocks}>
        <Harness
          orderId="o-1"
          factoryId="fac-1"
          lastTierId="tier-1"
          onAdded={vi.fn()}
          onRefetch={vi.fn()}
        />
      </MockedProvider>
    );

    act(() => api.handleClose(true));
    await waitFor(() => expect(findField("productId").options?.length).toBe(2));
    await new Promise((r) => setTimeout(r, 100));

    const setValue = api.formRef.current!.setValue;
    act(() => findField("productId").onChange!({ value: "prod-1" }, setValue));

    await waitFor(() => {
      expect(api.formRef.current!.getValues().tierId).toBe("tier-1");
      expect(api.formRef.current!.getValues().unitPrice).toContain("6,50");
    });
  });

  it("deixa o preço vazio em produto sem preço na tabela ativa", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <Harness
          orderId="o-1"
          factoryId="fac-1"
          onAdded={vi.fn()}
          onRefetch={vi.fn()}
        />
      </MockedProvider>
    );

    act(() => api.handleClose(true));
    await waitFor(() => expect(findField("productId").options?.length).toBe(2));
    // espera a tabela carregar
    await new Promise((r) => setTimeout(r, 100));

    const setValue = api.formRef.current!.setValue;
    // prod-2 não está na tabela: nada a sugerir, o vendedor digita o preço.
    act(() => findField("productId").onChange!({ value: "prod-2" }, setValue));
    act(() => findField("tierId").onChange!({ value: "tier-1" }, setValue));

    await new Promise((r) => setTimeout(r, 30));
    expect(api.formRef.current!.getValues().unitPrice ?? "").toBe("");
  });
});
