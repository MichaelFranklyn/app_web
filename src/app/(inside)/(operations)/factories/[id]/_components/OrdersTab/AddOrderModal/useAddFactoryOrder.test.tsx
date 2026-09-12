import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Os pedaços compartilhados do wizard têm testes próprios — aqui são dublês. */
const { createDraftItems, draft, redirect } = vi.hoisted(() => ({
  createDraftItems: vi.fn(async () => [] as string[]),
  draft: { items: [{ productId: "p1" }], reset: vi.fn() },
  redirect: vi.fn(),
}));

vi.mock("../../../../../_shared/orderDraftItems", async () => {
  const { gql } = await import("@apollo/client");
  return {
    createDraftItems,
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
vi.mock("../../../../../_shared/orderPaymentTerms", () => ({
  usePaymentTermOptions: () => ({
    options: [{ label: "30/60/90", value: "t1" }],
    minimumOf: () => null,
  }),
}));
vi.mock("../../../../../_shared/orderFreight", () => ({
  FREIGHT_OPTIONS: [{ label: "FOB", value: "FOB" }],
  useFreeFreightTarget: () => null,
}));
vi.mock("../../../../../_shared/orderCoverage", () => ({
  coverageHint: () => "dica",
  useCoverageSuggestion: () => {},
}));
vi.mock("@/hooks/useRedirectTransition", () => ({
  useRedirectTransition: () => ({ redirect, isRedirecting: false }),
}));

import { Toast } from "@/components/Toast";
import {
  CREATE_ORDER_FROM_FACTORY_MUTATION,
  FACTORY_ASSIGNMENTS_QUERY,
} from "../gql";
import { useAddFactoryOrder } from "./useAddFactoryOrder";

const FACTORY = "f1";

const assignment = (
  id: string,
  clientId: string,
  clientName: string,
  isNegative = false
) => ({
  __typename: "SellerClientFactoryType",
  id,
  sellerId: "s1",
  clientId,
  isNegative,
  negativeReason: isNegative ? "Inadimplente" : null,
  seller: { __typename: "UserType", id: "s1", name: "Rafael" },
  client: {
    __typename: "ClientType",
    id: clientId,
    razaoSocial: clientName,
    nomeFantasia: null,
    cnpj: "51909936000170",
  },
  cadence: { __typename: "CadenceType", days: 30, source: "ORDERS" },
});

const assignmentsMock = (nodes: unknown[]) => ({
  request: {
    query: FACTORY_ASSIGNMENTS_QUERY,
    variables: {
      input: {
        filters: [{ field: "factory_id", operator: "eq", value: FACTORY }],
        first: 200,
      },
    },
  },
  maxUsageCount: 10,
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

const createMock = (input: Record<string, unknown>, ok = true) => ({
  request: {
    query: CREATE_ORDER_FROM_FACTORY_MUTATION,
    variables: { input },
  },
  result: {
    data: {
      createOrder: {
        __typename: "OrderResponse",
        status: ok,
        code: ok ? 201 : 400,
        message: ok ? "Pedido criado" : "Cliente negativado",
        data: ok ? { __typename: "OrderType", id: "o-novo" } : null,
      },
    },
  },
});

const expectedInput = {
  sellerId: "s1",
  clientId: "c1",
  orderDate: "2026-09-12",
  paymentTermId: "t1",
  freightType: "FOB",
  notes: null,
  deliveryEstimateDays: 15,
  coverageDays: 30,
  isQuote: false,
  factoryId: FACTORY,
};

const form = (extra: Record<string, unknown> = {}) => ({
  orderKind: "order",
  assignment: { value: "a1" },
  orderDate: "2026-09-12",
  paymentTermId: { value: "t1" },
  freightType: { value: "FOB" },
  deliveryEstimateDays: "15",
  coverageDays: "30",
  notes: "",
  ...extra,
});

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

/** O modal só busca os vínculos depois de aberto (`skip: !open`). */
const run = (mocks: unknown[]) => {
  const { result } = renderHook(
    () => useAddFactoryOrder({ factoryId: FACTORY }),
    { wrapper: wrapper(mocks) }
  );
  act(() => result.current.handleClose(true));
  return result;
};

/** O campo do formulário, com as propriedades que este teste inspeciona. */
type TestField = {
  name: string;
  placeholder?: string;
  hint?: unknown;
  disabled?: boolean;
  options?: { label: string; value: string }[];
  onChange?: (
    value: unknown,
    setValue: (n: string, v: unknown) => void
  ) => void;
};

const field = (result: ReturnType<typeof run>, name: string): TestField =>
  result.current.formSteps[0].sections[0].fields.find(
    (f) => f.name === name
  )! as TestField;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAddFactoryOrder", () => {
  it("pela tela da fábrica, escolhe-se o par vendedor → cliente", async () => {
    const result = run([
      assignmentsMock([
        assignment("a1", "c1", "ALTO CONSTRUCAO"),
        assignment("a2", "c2", "ZETA COMERCIO"),
      ]),
    ]);

    await waitFor(() =>
      expect(field(result, "assignment").options).toHaveLength(2)
    );
    expect(field(result, "assignment").options?.[0].label).toContain(
      "Rafael →"
    );
  });

  it("cliente negativado aparece marcado, e não sumido", async () => {
    // Sumir da lista viraria "o sistema perdeu meu vínculo", e não "a fábrica
    // travou o crédito dele".
    const result = run([
      assignmentsMock([assignment("a1", "c1", "ALTO", true)]),
    ]);
    await waitFor(() =>
      expect(field(result, "assignment").options).toHaveLength(1)
    );

    expect(field(result, "assignment").options?.[0].label).toContain(
      "NEGATIVADO"
    );

    act(() => {
      field(result, "assignment").onChange?.({ value: "a1" }, vi.fn());
    });

    await waitFor(() => expect(field(result, "assignment").hint).toBeTruthy());
  });

  it("fábrica sem vínculo diz isso no lugar de um select vazio", async () => {
    const result = run([assignmentsMock([])]);

    await waitFor(() =>
      expect(field(result, "assignment").placeholder).toBe(
        "Sem vínculos disponíveis para esta fábrica"
      )
    );
  });

  it("a fábrica do pedido é a da tela, não uma escolha", async () => {
    const result = run([
      assignmentsMock([assignment("a1", "c1", "ALTO")]),
      createMock(expectedInput),
    ]);
    await waitFor(() =>
      expect(field(result, "assignment").options).toHaveLength(1)
    );

    act(() => result.current.handleDetailsValid(form()));
    expect(result.current.step).toBe(1);
    await act(() => result.current.handleCreate());

    await waitFor(() =>
      expect(redirect).toHaveBeenCalledWith("/orders/o-novo")
    );
  });

  it("orçamento nasce marcado como orçamento", async () => {
    const result = run([
      assignmentsMock([assignment("a1", "c1", "ALTO")]),
      createMock({ ...expectedInput, isQuote: true }),
    ]);
    await waitFor(() =>
      expect(field(result, "assignment").options).toHaveLength(1)
    );

    act(() => result.current.handleDetailsValid(form({ orderKind: "quote" })));
    await act(() => result.current.handleCreate());

    await waitFor(() => expect(redirect).toHaveBeenCalled());
  });

  it("recusa do backend não leva para pedido nenhum", async () => {
    const result = run([
      assignmentsMock([assignment("a1", "c1", "ALTO")]),
      createMock(expectedInput, false),
    ]);
    await waitFor(() =>
      expect(field(result, "assignment").options).toHaveLength(1)
    );

    act(() => result.current.handleDetailsValid(form()));
    await act(() => result.current.handleCreate());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(redirect).not.toHaveBeenCalled();
  });

  it("fechar o modal devolve o wizard ao início", async () => {
    const result = run([assignmentsMock([assignment("a1", "c1", "ALTO")])]);
    await waitFor(() =>
      expect(field(result, "assignment").options).toHaveLength(1)
    );

    act(() => result.current.handleDetailsValid(form()));
    act(() => result.current.handleClose(false));

    expect(result.current.step).toBe(0);
    expect(draft.reset).toHaveBeenCalled();
  });
});
