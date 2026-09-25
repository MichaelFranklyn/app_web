import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Novo pedido aberto da tela do cliente. Rascunho, condições e frete têm testes
 * próprios e entram como dublês: o que se prende aqui é o vínculo — ele decide
 * vendedor e fábrica, e o cliente é o da tela.
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

import { CLIENT_ASSIGNMENTS_QUERY } from "./gql";
import { withProviders } from "./testSupport";
import { useClientDetails } from "./useClientDetails";
import { useNewOrderCore } from "./useNewOrderCore";

const assignment = (
  id: string,
  sellerId: string,
  factoryId: string,
  extra: Record<string, unknown> = {}
) => ({
  __typename: "SellerClientFactoryType",
  id,
  sellerId,
  factoryId,
  isNegative: false,
  negativeReason: null,
  seller: { __typename: "UserType", id: sellerId, name: `Vend ${sellerId}` },
  factory: {
    __typename: "FactoryType",
    id: factoryId,
    nomeFantasia: `Fáb ${factoryId}`,
    nickname: null,
    razaoSocial: "LTDA",
  },
  client: {
    __typename: "ClientType",
    id: "c1",
    razaoSocial: "ALTO LTDA",
    nomeFantasia: "Alto",
  },
  cadence: null,
  ...extra,
});

const assignmentsMock = (nodes: unknown[]) => ({
  request: {
    query: CLIENT_ASSIGNMENTS_QUERY,
    variables: {
      input: {
        filters: [{ field: "client_id", operator: "eq", value: "c1" }],
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

const TWO = [
  assignment("a1", "s1", "f1"),
  assignment("a2", "s2", "f2", {
    isNegative: true,
    negativeReason: "Inadimplente",
  }),
];

const run = (nodes: unknown[] = TWO) =>
  renderHook(
    () => {
      const core = useNewOrderCore({ clientId: "c1" });
      const details = useClientDetails(core, "c1");
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

describe("useClientDetails", () => {
  it("o pedido nasce de um vínculo vendedor → fábrica do cliente", async () => {
    const result = run();

    await waitFor(() => expect(optionsOf(result)).toHaveLength(2));
    expect(optionsOf(result)[0].label).toBe("Vend s1 → Fáb f1");
    // O cabeçalho diz de quem é o pedido.
    expect(result.current.details.subject).toBe("ALTO LTDA");
  });

  it("vínculo negativado continua na lista, marcado", async () => {
    const result = run();

    await waitFor(() =>
      expect(optionsOf(result)[1].label).toBe("Vend s2 → Fáb f2 · NEGATIVADO")
    );
  });

  it("escolher o vínculo define a fábrica, avisa da negativação e limpa a condição", async () => {
    const result = run();
    await waitFor(() => expect(optionsOf(result)).toHaveLength(2));
    const setValue = vi.fn();

    act(() =>
      field(result, "assignment").onChange?.({ value: "a2" }, setValue)
    );

    expect(result.current.core.factoryId).toBe("f2");
    expect(setValue).toHaveBeenCalledWith("paymentTermId", "");
    expect(field(result, "assignment").hint).toBeTruthy();
  });

  it("cliente sem vínculo diz isso no lugar de um select vazio", async () => {
    const result = run([]);

    await waitFor(() =>
      expect(field(result, "assignment").placeholder).toBe(
        "Cliente sem vínculos cadastrados"
      )
    );
  });

  it("vendedor e fábrica vêm do vínculo; o cliente é o da tela", async () => {
    const result = run();
    await waitFor(() => expect(optionsOf(result)).toHaveLength(2));

    const input = result.current.details.toInput({
      orderKind: "quote",
      assignment: { value: "a1" },
      orderDate: "2026-09-12",
    });

    expect(input).toMatchObject({
      sellerId: "s1",
      factoryId: "f1",
      clientId: "c1",
      orderDate: "2026-09-12",
      isQuote: true,
    });
  });

  it("vínculo que não existe mais não grava nada", async () => {
    const result = run();
    await waitFor(() => expect(optionsOf(result)).toHaveLength(2));

    expect(
      result.current.details.toInput({ assignment: { value: "sumiu" } })
    ).toBeNull();
  });
});
