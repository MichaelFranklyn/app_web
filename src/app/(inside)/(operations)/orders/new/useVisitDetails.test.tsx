import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

/**
 * Pedido lançado de dentro da visita: tudo já vem decidido, e o que se prende
 * aqui é que o pedido sai amarrado à visita, com o vínculo dela.
 */
vi.mock("../../_shared/orderDraftItems", async () => {
  const { gql } = await import("@apollo/client");
  return {
    createDraftItems: vi.fn(async () => []),
    useOrderDraftItems: () => ({ items: [], reset: vi.fn() }),
    CREATE_ORDER_ITEM_MUTATION: gql`
      mutation CreateOrderItem {
        createOrderItem {
          status
        }
      }
    `,
  };
});
vi.mock("../../_shared/orderPaymentTerms", () => ({
  usePaymentTermOptions: () => ({ options: [], minimumOf: () => null }),
}));
vi.mock("../../_shared/orderFreight", () => ({
  FREIGHT_OPTIONS: [],
  useFreeFreightTarget: () => null,
}));
vi.mock("../../_shared/orderCoverage", () => ({
  coverageHint: () => "dica",
  useCoverageSuggestion: () => {},
}));
vi.mock("@/hooks/useRedirectTransition", () => ({
  useRedirectTransition: () => ({ redirect: vi.fn(), isRedirecting: false }),
}));

import { CLIENT_ASSIGNMENTS_QUERY } from "./gql";
import { withProviders } from "./testSupport";
import { useNewOrderCore } from "./useNewOrderCore";
import { useVisitDetails } from "./useVisitDetails";

const ORIGIN = {
  kind: "visit" as const,
  visitItemId: "v1",
  sellerId: "s1",
  clientId: "c1",
  factoryId: "f1",
};

const linkMock = (isNegative = false) => ({
  request: {
    query: CLIENT_ASSIGNMENTS_QUERY,
    variables: {
      input: {
        first: 1,
        filters: [
          { field: "client_id", operator: "eq", value: "c1" },
          { field: "factory_id", operator: "eq", value: "f1" },
          { field: "seller_id", operator: "eq", value: "s1" },
        ],
      },
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      sellerClientFactoryList: {
        __typename: "SellerClientFactoryConnection",
        edges: [
          {
            __typename: "SellerClientFactoryEdge",
            node: {
              __typename: "SellerClientFactoryType",
              id: "a1",
              sellerId: "s1",
              factoryId: "f1",
              isNegative,
              negativeReason: isNegative ? "Inadimplente" : null,
              seller: { __typename: "UserType", id: "s1", name: "Rafael" },
              factory: {
                __typename: "FactoryType",
                id: "f1",
                nomeFantasia: "HERC",
                nickname: null,
                razaoSocial: "HERC SA",
              },
              client: {
                __typename: "ClientType",
                id: "c1",
                razaoSocial: "ALTO LTDA",
                nomeFantasia: "Alto",
              },
              cadence: null,
            },
          },
        ],
        totalCount: 1,
      },
    },
  },
});

const run = (isNegative = false) =>
  renderHook(
    () => {
      const core = useNewOrderCore({ factoryId: "f1", clientId: "c1" });
      const details = useVisitDetails(core, ORIGIN);
      return { core, details };
    },
    { wrapper: withProviders([linkMock(isNegative)]) }
  ).result;

describe("useVisitDetails", () => {
  it("fábrica e cliente já vêm da visita: os itens abrem sem escolher nada", () => {
    const result = run();
    expect(result.current.core.factoryId).toBe("f1");
    expect(result.current.core.clientId).toBe("c1");
  });

  it("o pedido sai amarrado à visita, com o vínculo dela", () => {
    const result = run();

    expect(
      result.current.details.toInput({
        orderKind: "order",
        orderDate: "2026-09-25",
      })
    ).toMatchObject({
      sellerId: "s1",
      clientId: "c1",
      factoryId: "f1",
      orderDate: "2026-09-25",
      visitScheduleItemId: "v1",
      isQuote: false,
    });
  });

  it("abre com a data de hoje — o pedido nasce durante a visita", () => {
    const result = run();
    expect(result.current.details.initialData?.orderDate).toBeInstanceOf(Date);
  });

  it("o cabeçalho diz de quem e de qual fábrica é o pedido", async () => {
    const result = run();

    await waitFor(() =>
      expect(result.current.details.subject).toBe("ALTO LTDA")
    );
    expect(result.current.details.description).toContain("HERC");
  });

  it("vínculo negativado avisa antes de o pedido ser montado", async () => {
    const result = run(true);

    await waitFor(() =>
      expect(
        result.current.details.formSteps[0].sections[0].fields.find(
          (f) => f.name === "orderDate"
        )?.hint
      ).toContain("Inadimplente")
    );
  });
});
