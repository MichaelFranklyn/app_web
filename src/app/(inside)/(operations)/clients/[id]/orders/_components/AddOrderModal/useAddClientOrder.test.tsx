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
vi.mock("@/hooks/useRedirectTransition", () => ({
  useRedirectTransition: () => ({ redirect, isRedirecting: false }),
}));

import { Toast } from "@/components/Toast";
import {
  CLIENT_ASSIGNMENTS_QUERY,
  CREATE_ORDER_FROM_CLIENT_MUTATION,
} from "./gql";
import { useAddClientOrder } from "./useAddClientOrder";

const CLIENT = "c1";

const assignment = (
  id: string,
  factoryId: string,
  isNegative = false,
  negativeReason: string | null = null
) => ({
  __typename: "SellerClientFactoryType",
  id,
  sellerId: "s1",
  factoryId,
  isNegative,
  negativeReason,
  seller: { __typename: "UserType", id: "s1", name: "Rafael" },
  factory: {
    __typename: "FactoryType",
    id: factoryId,
    nomeFantasia: factoryId === "f1" ? "HERC" : "Silvana",
    nickname: null,
    razaoSocial: "Fábrica SA",
  },
});

const assignmentsMock = (nodes: unknown[]) => ({
  request: {
    query: CLIENT_ASSIGNMENTS_QUERY,
    variables: {
      input: {
        filters: [{ field: "client_id", operator: "eq", value: CLIENT }],
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
    query: CREATE_ORDER_FROM_CLIENT_MUTATION,
    variables: { input },
  },
  result: {
    data: {
      createOrder: {
        __typename: "OrderResponse",
        status: ok,
        code: ok ? 201 : 400,
        message: ok ? "Pedido criado" : "Cliente negativado nesta fábrica",
        data: ok ? { __typename: "OrderType", id: "o-novo" } : null,
      },
    },
  },
});

const expectedInput = {
  sellerId: "s1",
  clientId: CLIENT,
  factoryId: "f1",
  orderDate: "2026-09-12",
  paymentTermId: "t1",
  freightType: "FOB",
  notes: "urgente",
  deliveryEstimateDays: 15,
  coverageDays: 30,
  isQuote: false,
};

const form = (extra: Record<string, unknown> = {}) => ({
  orderKind: "order",
  assignment: { value: "a1" },
  orderDate: "2026-09-12",
  paymentTermId: { value: "t1" },
  freightType: { value: "FOB" },
  deliveryEstimateDays: "15",
  coverageDays: "30",
  notes: "urgente",
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
  const { result } = renderHook(() => useAddClientOrder(CLIENT), {
    wrapper: wrapper(mocks),
  });
  act(() => result.current.setOpen(true));
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

describe("useAddClientOrder", () => {
  it("o pedido nasce de um vínculo vendedor → fábrica do cliente", async () => {
    const result = run([
      assignmentsMock([assignment("a1", "f1"), assignment("a2", "f2")]),
    ]);

    await waitFor(() => expect(result.current.assignmentCount).toBe(2));
    expect(field(result, "assignment").options?.[0].label).toBe(
      "Rafael → HERC"
    );
  });

  it("vínculo negativado continua na lista, marcado", async () => {
    // Escondê-lo faria a fábrica sumir sem explicação para quem não sabe da
    // negativação — e o backend recusaria o pedido só no fim.
    const result = run([
      assignmentsMock([assignment("a1", "f1", true, "Inadimplente")]),
    ]);

    await waitFor(() => expect(result.current.assignmentCount).toBe(1));
    expect(field(result, "assignment").options?.[0].label).toContain(
      "NEGATIVADO"
    );
  });

  it("escolher o vínculo avisa da negativação e limpa a condição", async () => {
    // A condição é da fábrica: manter a anterior mandaria um prazo de outra.
    const result = run([
      assignmentsMock([assignment("a1", "f1", true, "Inadimplente")]),
    ]);
    await waitFor(() => expect(result.current.assignmentCount).toBe(1));
    const setValue = vi.fn();

    act(() => {
      field(result, "assignment").onChange?.({ value: "a1" }, setValue);
    });

    expect(setValue).toHaveBeenCalledWith("paymentTermId", "");
    await waitFor(() => expect(field(result, "assignment").hint).toBeTruthy());
  });

  it("cliente sem vínculo diz isso no lugar de um select vazio", async () => {
    const result = run([assignmentsMock([])]);

    await waitFor(() =>
      expect(field(result, "assignment").placeholder).toBe(
        "Cliente sem vínculos cadastrados"
      )
    );
  });

  it("o vendedor do pedido vem do vínculo, não de uma escolha", async () => {
    const result = run([
      assignmentsMock([assignment("a1", "f1")]),
      createMock(expectedInput),
    ]);
    await waitFor(() => expect(result.current.assignmentCount).toBe(1));

    act(() => result.current.handleDetailsValid(form()));
    expect(result.current.step).toBe(1);

    await act(() => result.current.handleCreate());

    await waitFor(() =>
      expect(redirect).toHaveBeenCalledWith("/orders/o-novo")
    );
  });

  it("orçamento nasce marcado como orçamento", async () => {
    const result = run([
      assignmentsMock([assignment("a1", "f1")]),
      createMock({ ...expectedInput, isQuote: true }),
    ]);
    await waitFor(() => expect(result.current.assignmentCount).toBe(1));

    act(() => result.current.handleDetailsValid(form({ orderKind: "quote" })));
    await act(() => result.current.handleCreate());

    await waitFor(() => expect(redirect).toHaveBeenCalled());
  });

  it("vínculo que não existe mais não avança o wizard", async () => {
    const result = run([assignmentsMock([assignment("a1", "f1")])]);
    await waitFor(() => expect(result.current.assignmentCount).toBe(1));

    act(() =>
      result.current.handleDetailsValid(form({ assignment: { value: "a9" } }))
    );

    expect(result.current.step).toBe(0);
  });

  it("recusa do backend não leva para pedido nenhum", async () => {
    const result = run([
      assignmentsMock([assignment("a1", "f1")]),
      createMock(expectedInput, false),
    ]);
    await waitFor(() => expect(result.current.assignmentCount).toBe(1));

    act(() => result.current.handleDetailsValid(form()));
    await act(() => result.current.handleCreate());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(redirect).not.toHaveBeenCalled();
  });

  it("fechar o modal devolve o wizard ao início", async () => {
    const result = run([assignmentsMock([assignment("a1", "f1")])]);
    await waitFor(() => expect(result.current.assignmentCount).toBe(1));

    act(() => result.current.handleDetailsValid(form()));
    act(() => result.current.setOpen(false));

    expect(result.current.step).toBe(0);
    expect(draft.reset).toHaveBeenCalled();
  });
});
