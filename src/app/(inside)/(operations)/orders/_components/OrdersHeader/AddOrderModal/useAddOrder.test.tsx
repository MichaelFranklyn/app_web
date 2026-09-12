import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Os pedaços compartilhados do wizard (rascunho de itens, condições, frete,
 * cobertura, carteira) têm testes próprios: aqui eles entram como dublês, para
 * o que se prende ser o wizard — a cascata, o que vai na mutation e o que
 * acontece quando um item falha.
 */
const {
  createDraftItems,
  draft,
  redirect,
  paymentTerms,
  freeFreight,
  clientOptions,
} = vi.hoisted(() => ({
  createDraftItems: vi.fn(async () => [] as string[]),
  draft: { items: [{ productId: "p1" }], reset: vi.fn() },
  redirect: vi.fn(),
  paymentTerms: {
    options: [{ label: "30/60/90", value: "t1" }],
    minimumOf: vi.fn(() => null),
  },
  freeFreight: null as unknown,
  clientOptions: {
    options: [{ label: "Alto", value: "c1" }],
    cadenceByClient: new Map(),
    negativeByClient: new Map([["c-negativado", "Inadimplente"]]),
    onSearch: undefined,
    loading: false,
  },
}));

vi.mock("../../../../_shared/orderDraftItems", async () => {
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
vi.mock("../../../../_shared/orderPaymentTerms", () => ({
  usePaymentTermOptions: () => paymentTerms,
}));
vi.mock("../../../../_shared/orderFreight", () => ({
  FREIGHT_OPTIONS: [{ label: "FOB", value: "FOB" }],
  useFreeFreightTarget: () => freeFreight,
}));
vi.mock("../../../../_shared/orderCoverage", () => ({
  coverageHint: () => "dica",
  useCoverageSuggestion: () => {},
}));
vi.mock("../useOrderClientOptions", () => ({
  useOrderClientOptions: () => clientOptions,
}));
vi.mock("@/hooks/useRedirectTransition", () => ({
  useRedirectTransition: () => ({ redirect, isRedirecting: false }),
}));

import { Toast } from "@/components/Toast";
import {
  CREATE_ORDER_MUTATION,
  ORDER_SELLER_FACTORIES_QUERY,
  ORDER_SELLERS_OPTIONS_QUERY,
} from "../gql";
import { useAddOrder } from "./useAddOrder";

const LIST_INPUT = { first: 200 };

const sellersMock = {
  request: {
    query: ORDER_SELLERS_OPTIONS_QUERY,
    variables: { input: LIST_INPUT },
  },
  maxUsageCount: 5,
  result: {
    data: {
      order_sellers_options: {
        __typename: "UserTypeConnection",
        edges: [
          {
            __typename: "UserTypeEdge",
            node: { __typename: "UserType", id: "s1", name: "Rafael" },
          },
        ],
      },
    },
  },
};

const factoriesMock = (sellerId: string) => ({
  request: {
    query: ORDER_SELLER_FACTORIES_QUERY,
    variables: {
      input: {
        ...LIST_INPUT,
        filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
      },
    },
  },
  maxUsageCount: 5,
  result: {
    data: {
      sellerFactoryAccessList: {
        __typename: "SellerFactoryAccessConnection",
        edges: [
          {
            __typename: "SellerFactoryAccessEdge",
            node: {
              __typename: "SellerFactoryAccessType",
              factoryId: "f1",
              factory: {
                __typename: "FactoryType",
                id: "f1",
                nomeFantasia: "HERC",
                nickname: null,
                razaoSocial: "HERC SA",
              },
            },
          },
        ],
      },
    },
  },
});

const createdOrder = {
  __typename: "OrderType",
  id: "o-novo",
  orderDate: "2026-09-12",
  invoicedAt: null,
  totalAmount: "0",
  commissionAmount: "0",
  status: "DRAFT",
  seller: { __typename: "UserType", id: "s1", name: "Rafael" },
  client: {
    __typename: "ClientType",
    id: "c1",
    razaoSocial: "ALTO LTDA",
    nomeFantasia: "Alto",
  },
  factory: {
    __typename: "FactoryType",
    id: "f1",
    nomeFantasia: "HERC",
    nickname: null,
    razaoSocial: "HERC SA",
  },
};

const createMock = (input: Record<string, unknown>, ok = true) => ({
  request: { query: CREATE_ORDER_MUTATION, variables: { input } },
  result: {
    data: {
      createOrder: {
        __typename: "OrderResponse",
        status: ok,
        code: ok ? 201 : 400,
        message: ok ? "Pedido criado" : "Cliente negativado",
        data: ok ? createdOrder : null,
      },
    },
  },
});

/** O passo 1 preenchido como o formulário o entrega. */
const details = (extra: Record<string, unknown> = {}) => ({
  orderKind: "order",
  sellerId: { value: "s1" },
  factoryId: { value: "f1" },
  clientId: { value: "c1" },
  orderDate: "2026-09-12",
  paymentTermId: { value: "t1" },
  freightType: { value: "FOB" },
  deliveryEstimateDays: "15",
  coverageDays: "30",
  notes: "sem observação",
  ...extra,
});

const expectedInput = {
  sellerId: "s1",
  clientId: "c1",
  factoryId: "f1",
  orderDate: "2026-09-12",
  paymentTermId: "t1",
  freightType: "FOB",
  notes: "sem observação",
  deliveryEstimateDays: 15,
  coverageDays: 30,
  isQuote: false,
};

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

const run = (
  mocks: unknown[] = [],
  props: { canSelectSeller?: boolean; ownSellerId?: string | null } = {}
) => {
  const onAddOptimistic = vi.fn();
  const { result } = renderHook(
    () =>
      useAddOrder({
        onAddOptimistic,
        canSelectSeller: props.canSelectSeller ?? true,
        ownSellerId: props.ownSellerId ?? null,
      }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onAddOptimistic };
};

const fieldsOf = (result: ReturnType<typeof run>["result"]) =>
  result.current.formSteps[0].sections[0].fields;

const field = (result: ReturnType<typeof run>["result"], name: string) =>
  fieldsOf(result).find((f) => f.name === name)!;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useAddOrder — a cascata do passo 1", () => {
  it("vendedor não escolhe de quem é o pedido: já é dele", async () => {
    // A query `sellers` é admin-only (403 para o vendedor) e o backend força o
    // vendedor do token — o campo existir só o travaria num select vazio.
    const { result } = run([], {
      canSelectSeller: false,
      ownSellerId: "s-eu",
    });

    expect(fieldsOf(result).map((f) => f.name)).not.toContain("sellerId");
    // A fábrica já abre destravada: a cascata começa no próprio perfil.
    expect(field(result, "factoryId").disabled).toBe(false);
  });

  it("gestor começa com a fábrica travada até escolher o vendedor", () => {
    const { result } = run([sellersMock]);

    expect(field(result, "factoryId").disabled).toBe(true);
    expect(field(result, "factoryId").placeholder).toBe(
      "Selecione o vendedor primeiro"
    );
    expect(field(result, "clientId").disabled).toBe(true);
  });

  it("trocar de vendedor limpa a fábrica e o cliente já escolhidos", async () => {
    const { result } = run([sellersMock, factoriesMock("s1")]);
    const setValue = vi.fn();

    act(() => {
      field(result, "sellerId").onChange?.({ value: "s1" }, setValue);
    });

    expect(setValue).toHaveBeenCalledWith("factoryId", "");
    expect(setValue).toHaveBeenCalledWith("clientId", "");
    await waitFor(() =>
      expect(field(result, "factoryId").disabled).toBe(false)
    );
  });

  it("trocar de fábrica limpa o cliente E a condição de pagamento", () => {
    // A condição é da fábrica: manter a anterior mandaria um prazo que não
    // existe na nova.
    const { result } = run([sellersMock]);
    const setValue = vi.fn();

    act(() => {
      field(result, "factoryId").onChange?.({ value: "f1" }, setValue);
    });

    expect(setValue).toHaveBeenCalledWith("clientId", "");
    expect(setValue).toHaveBeenCalledWith("paymentTermId", "");
  });

  it("avisa da negativação antes de o vendedor digitar o pedido inteiro", async () => {
    // É o mesmo motivo que o backend responderia na recusa — só que antes.
    const { result } = run([sellersMock]);

    act(() => {
      field(result, "factoryId").onChange?.({ value: "f1" }, vi.fn());
    });
    act(() => {
      field(result, "clientId").onChange?.({ value: "c-negativado" }, vi.fn());
    });

    await waitFor(() => expect(field(result, "clientId").hint).toBeTruthy());
  });
});

describe("useAddOrder — criar", () => {
  it("guarda o passo 1 e só grava no fim do passo 2", async () => {
    const { result, onAddOptimistic } = run([
      sellersMock,
      createMock(expectedInput),
    ]);

    act(() => result.current.handleDetailsValid(details()));
    expect(result.current.step).toBe(1);
    expect(onAddOptimistic).not.toHaveBeenCalled();

    await act(() => result.current.handleCreate());

    await waitFor(() =>
      expect(onAddOptimistic).toHaveBeenCalledWith(
        expect.objectContaining({ id: "o-novo" })
      )
    );
    expect(redirect).toHaveBeenCalledWith("/orders/o-novo");
  });

  it("orçamento nasce marcado como orçamento", async () => {
    // Só o pedido pode ser faturado; o orçamento é convertido depois.
    const { result } = run([
      sellersMock,
      createMock({ ...expectedInput, isQuote: true }),
    ]);

    act(() =>
      result.current.handleDetailsValid(details({ orderKind: "quote" }))
    );
    await act(() => result.current.handleCreate());

    await waitFor(() => expect(redirect).toHaveBeenCalled());
  });

  it("os itens do rascunho são gravados depois que o pedido existe", async () => {
    // O backend não aceita itens no CreateOrderInput.
    const { result } = run([sellersMock, createMock(expectedInput)]);

    act(() => result.current.handleDetailsValid(details()));
    await act(() => result.current.handleCreate());

    await waitFor(() => expect(createDraftItems).toHaveBeenCalledOnce());
    const [, orderId] = createDraftItems.mock.calls[0] as unknown as [
      unknown,
      string,
    ];
    expect(orderId).toBe("o-novo");
  });

  it("item que falhou não desfaz o pedido — ele avisa e segue", async () => {
    createDraftItems.mockResolvedValueOnce(["Produto 1"]);
    const { result, onAddOptimistic } = run([
      sellersMock,
      createMock(expectedInput),
    ]);

    act(() => result.current.handleDetailsValid(details()));
    await act(() => result.current.handleCreate());

    await waitFor(() => expect(onAddOptimistic).toHaveBeenCalledOnce());
    expect(redirect).toHaveBeenCalledWith("/orders/o-novo");
  });

  it("recusa do backend não insere pedido nenhum na lista", async () => {
    const { result, onAddOptimistic } = run([
      sellersMock,
      createMock(expectedInput, false),
    ]);

    act(() => result.current.handleDetailsValid(details()));
    await act(() => result.current.handleCreate());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onAddOptimistic).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("sem o passo 1 validado, o passo 2 não grava nada", async () => {
    const { result, onAddOptimistic } = run([sellersMock]);

    await act(() => result.current.handleCreate());

    expect(onAddOptimistic).not.toHaveBeenCalled();
  });

  it("fechar o modal devolve o wizard ao início", () => {
    const { result } = run([sellersMock]);

    act(() => result.current.handleDetailsValid(details()));
    act(() => result.current.handleClose(false));

    expect(result.current.step).toBe(0);
    expect(draft.reset).toHaveBeenCalled();
  });
});
