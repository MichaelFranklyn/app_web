import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Os pedaços compartilhados da página (rascunho de itens, condições, frete,
 * cobertura, carteira) têm testes próprios: aqui eles entram como dublês, para
 * o que se prende ser a página de novo pedido — a cascata, o que vai na
 * mutation e o que acontece quando um item falha.
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

vi.mock("../../_shared/orderDraftItems", async () => {
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
vi.mock("../../_shared/orderPaymentTerms", () => ({
  usePaymentTermOptions: () => paymentTerms,
}));
vi.mock("../../_shared/orderFreight", () => ({
  FREIGHT_OPTIONS: [{ label: "FOB", value: "FOB" }],
  useFreeFreightTarget: () => freeFreight,
}));
vi.mock("../../_shared/orderCoverage", () => ({
  coverageHint: () => "dica",
  useCoverageSuggestion: () => {},
}));
vi.mock("../_shared/orderCreate", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useOrderClientOptions: () => clientOptions,
}));
vi.mock("@/hooks/useRedirectTransition", () => ({
  useRedirectTransition: () => ({ redirect, isRedirecting: false }),
}));

import {
  CREATE_ORDER_MUTATION,
  ORDER_SELLER_FACTORIES_QUERY,
  ORDER_SELLERS_OPTIONS_QUERY,
} from "../_shared/orderCreate";
import { withProviders } from "./testSupport";
import { useCascadeDetails } from "./useCascadeDetails";
import { useNewOrderCore } from "./useNewOrderCore";

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

/** Os dados do pedido como o formulário os entrega. */
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

const wrapper = withProviders;

const run = (
  mocks: unknown[] = [],
  props: { canSelectSeller?: boolean; ownSellerId?: string | null } = {}
) => {
  const { result } = renderHook(
    () => {
      const core = useNewOrderCore();
      const details = useCascadeDetails(core, {
        canSelectSeller: props.canSelectSeller ?? true,
        ownSellerId: props.ownSellerId ?? null,
      });
      return { core, details };
    },
    { wrapper: wrapper(mocks) }
  );
  return { result };
};

const fieldsOf = (result: ReturnType<typeof run>["result"]) =>
  result.current.details.formSteps[0].sections[0].fields;

const field = (result: ReturnType<typeof run>["result"], name: string) =>
  fieldsOf(result).find((f) => f.name === name)!;

/** "Criar pedido" com o formulário válido: a origem monta o input, o núcleo grava. */
const create = (
  result: ReturnType<typeof run>["result"],
  data: Record<string, unknown>
) => result.current.core.create(result.current.details.toInput(data)!);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useCascadeDetails — a cascata dos dados", () => {
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

describe("useNewOrderCore — itens na mesma tela", () => {
  it("trocar de fábrica descarta o rascunho de itens", () => {
    // Os itens são produtos DA fábrica: com outra fábrica eles não existem.
    const { result } = run([sellersMock]);

    act(() => {
      field(result, "factoryId").onChange?.({ value: "f1" }, vi.fn());
    });

    expect(draft.reset).toHaveBeenCalled();
    expect(result.current.core.factoryId).toBe("f1");
  });

  it("a condição escolhida já avisa o mínimo junto dos itens", () => {
    // Na página os itens estão à vista antes de o formulário ser enviado: o
    // piso tem de vir da escolha, não dos dados validados.
    const { result } = run([sellersMock]);

    act(() => {
      field(result, "paymentTermId").onChange?.({ value: "t1" }, vi.fn());
    });

    expect(paymentTerms.minimumOf).toHaveBeenLastCalledWith("t1");
  });
});

describe("useNewOrderCore — criar", () => {
  it("cria o pedido com os dados do formulário e entra nele", async () => {
    const { result } = run([sellersMock, createMock(expectedInput)]);

    await act(() => create(result, details()));

    await waitFor(() =>
      expect(redirect).toHaveBeenCalledWith("/orders/o-novo")
    );
  });

  it("orçamento nasce marcado como orçamento", async () => {
    // Só o pedido pode ser faturado; o orçamento é convertido depois.
    const { result } = run([
      sellersMock,
      createMock({ ...expectedInput, isQuote: true }),
    ]);

    await act(() => create(result, details({ orderKind: "quote" })));

    await waitFor(() => expect(redirect).toHaveBeenCalled());
  });

  it("os itens do rascunho são gravados depois que o pedido existe", async () => {
    // O backend não aceita itens no CreateOrderInput.
    const { result } = run([sellersMock, createMock(expectedInput)]);

    await act(() => create(result, details()));

    await waitFor(() => expect(createDraftItems).toHaveBeenCalledOnce());
    const [, orderId] = createDraftItems.mock.calls[0] as unknown as [
      unknown,
      string,
    ];
    expect(orderId).toBe("o-novo");
  });

  it("item que falhou não desfaz o pedido — ele avisa e segue", async () => {
    createDraftItems.mockResolvedValueOnce(["Produto 1"]);
    const { result } = run([sellersMock, createMock(expectedInput)]);

    await act(() => create(result, details()));

    await waitFor(() =>
      expect(redirect).toHaveBeenCalledWith("/orders/o-novo")
    );
  });

  it("recusa do backend não sai da página", async () => {
    const { result } = run([sellersMock, createMock(expectedInput, false)]);

    await act(() => create(result, details()));

    await waitFor(() => expect(result.current.core.isLoading).toBe(false));
    expect(createDraftItems).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
