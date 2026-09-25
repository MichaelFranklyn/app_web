import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Novo pedido aberto da tela da fábrica. Rascunho, condições e frete têm testes
 * próprios e entram como dublês: o que se prende aqui é o vínculo — ele decide
 * vendedor e cliente, e a fábrica é a da tela.
 */
const { draft, paymentTerms } = vi.hoisted(() => ({
  draft: { items: [], reset: vi.fn() },
  paymentTerms: { options: [], minimumOf: vi.fn(() => null) },
}));

vi.mock("../../_shared/orderDraftItems", async () => {
  const { gql } = await import("@apollo/client");
  return {
    createDraftItems: vi.fn(async () => []),
    useOrderDraftItems: () => draft,
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
  usePaymentTermOptions: () => paymentTerms,
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

import { FACTORY_ASSIGNMENTS_QUERY } from "../../_shared/orderAssignments";
import { withProviders } from "./testSupport";
import { useFactoryDetails } from "./useFactoryDetails";
import { useNewOrderCore } from "./useNewOrderCore";

const assignment = (id: string, sellerId: string, clientId: string) => ({
  __typename: "SellerClientFactoryType",
  id,
  sellerId,
  clientId,
  isNegative: false,
  negativeReason: null,
  seller: { __typename: "UserType", id: sellerId, name: `Vend ${sellerId}` },
  client: {
    __typename: "ClientType",
    id: clientId,
    razaoSocial: "ALTO LTDA",
    nomeFantasia: `Cli ${clientId}`,
    cnpj: null,
  },
  cadence: null,
});

const assignmentsMock = (nodes: unknown[]) => ({
  request: {
    query: FACTORY_ASSIGNMENTS_QUERY,
    variables: {
      input: {
        filters: [{ field: "factory_id", operator: "eq", value: "f1" }],
        first: 200,
      },
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      sellerClientFactoryList: {
        __typename: "SellerClientFactoryConnection",
        edges: nodes.map((node) => ({
          __typename: "SellerClientFactoryEdge",
          node,
        })),
        totalCount: nodes.length,
      },
    },
  },
});

const run = (nodes: unknown[] = [assignment("a1", "s1", "c1")]) =>
  renderHook(
    () => {
      const core = useNewOrderCore({ factoryId: "f1" });
      const details = useFactoryDetails(core, "f1");
      return { core, details };
    },
    { wrapper: withProviders([assignmentsMock(nodes)]) }
  ).result;

type Result = ReturnType<typeof run>;
const field = (result: Result, name: string) =>
  result.current.details.formSteps[0].sections[0].fields.find(
    (f) => f.name === name
  )!;
const optionsOf = (result: Result) =>
  (field(result, "assignment") as { options: { label: string }[] }).options;

beforeEach(() => vi.clearAllMocks());

describe("useFactoryDetails", () => {
  it("a fábrica já vem decidida: os itens abrem sem escolher nada", () => {
    const result = run();
    expect(result.current.core.factoryId).toBe("f1");
  });

  it("escolhe-se o par vendedor → cliente", async () => {
    const result = run();

    await waitFor(() => expect(optionsOf(result)).toHaveLength(1));
    expect(optionsOf(result)[0].label).toBe("Vend s1 → Cli c1");
  });

  it("escolher o vínculo define o cliente (preço pelo nível dele)", async () => {
    const result = run();
    await waitFor(() => expect(optionsOf(result)).toHaveLength(1));

    act(() => field(result, "assignment").onChange?.({ value: "a1" }, vi.fn()));

    expect(result.current.core.clientId).toBe("c1");
  });

  it("fábrica sem vínculo diz isso no lugar de um select vazio", async () => {
    const result = run([]);

    await waitFor(() =>
      expect(field(result, "assignment").placeholder).toBe(
        "Sem vínculos disponíveis para esta fábrica"
      )
    );
  });

  it("a fábrica do pedido é a da tela, não uma escolha", async () => {
    const result = run();
    await waitFor(() => expect(optionsOf(result)).toHaveLength(1));

    expect(
      result.current.details.toInput({
        orderKind: "order",
        assignment: { value: "a1" },
        orderDate: "2026-09-12",
      })
    ).toMatchObject({
      sellerId: "s1",
      clientId: "c1",
      factoryId: "f1",
      isQuote: false,
    });
  });
});
