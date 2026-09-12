import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Vínculos, condições e catálogo da fábrica têm hooks próprios: dublês aqui. */
const { assignments } = vi.hoisted(() => ({
  assignments: { nodes: [] as unknown[] },
}));

vi.mock("@/hooks/useCompleteList", () => ({
  useCompleteList: () => ({
    data: {
      sellerClientFactoryList: {
        edges: assignments.nodes.map((node) => ({ node })),
      },
    },
    error: undefined,
  }),
}));
vi.mock("../../../../../_shared/orderPaymentTerms", () => ({
  usePaymentTermOptions: () => ({
    options: [{ label: "30/60/90", value: "t1" }],
    minimumOf: () => null,
  }),
}));
vi.mock("../../../../../_shared/orderItemCatalog", () => ({
  useCompanyFactoryNode: () => ({ ipiInOrder: true }),
}));
vi.mock("../../../../../_shared/orderCoverage", () => ({
  coverageHint: () => "dica",
  useCoverageSuggestion: () => {},
}));

import { Toast } from "@/components/Toast";
import { CREATE_ORDER_FROM_FACTORY_MUTATION } from "../gql";
import { useImportFactoryOrder } from "./useImportFactoryOrder";

const FACTORY = "f1";

const assignment = (id: string, clientId: string) => ({
  id,
  sellerId: "s1",
  clientId,
  isNegative: false,
  negativeReason: null,
  seller: { id: "s1", name: "Rafael" },
  client: {
    id: clientId,
    razaoSocial: "ALTO",
    nomeFantasia: null,
    cnpj: "51909936000170",
  },
  cadence: { days: 30, source: "ORDERS" },
});

const pendingInput = {
  sellerId: "s1",
  clientId: "c1",
  orderDate: "2026-09-12",
  paymentTermId: "t1",
  freightType: null,
  deliveryEstimateDays: 15,
  coverageDays: 30,
  factoryId: FACTORY,
};

const createMock = (ok = true) => ({
  request: {
    query: CREATE_ORDER_FROM_FACTORY_MUTATION,
    variables: { input: pendingInput },
  },
  maxUsageCount: 5,
  result: {
    data: {
      createOrder: {
        __typename: "OrderResponse",
        status: ok,
        code: ok ? 201 : 400,
        message: ok ? "Pedido criado" : "Cliente negativado",
        data: ok
          ? {
              __typename: "OrderType",
              id: "o-novo",
              orderDate: "2026-09-12",
              totalAmount: "0",
              commissionAmount: "0",
              status: "DRAFT",
              seller: { __typename: "UserType", id: "s1", name: "Rafael" },
              client: {
                __typename: "ClientType",
                id: "c1",
                razaoSocial: "ALTO",
                nomeFantasia: null,
              },
              factory: {
                __typename: "FactoryType",
                id: FACTORY,
                nomeFantasia: "HERC",
                nickname: null,
                razaoSocial: "HERC SA",
              },
            }
          : null,
      },
    },
  },
});

const form = (extra: Record<string, unknown> = {}) => ({
  assignment: { value: "a1" },
  orderDate: "2026-09-12",
  paymentTermId: { value: "t1" },
  freightType: null,
  deliveryEstimateDays: "15",
  coverageDays: "30",
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

const run = (mocks: unknown[] = []) => {
  const onChanged = vi.fn();
  const onAddOptimistic = vi.fn();
  const { result } = renderHook(
    () =>
      useImportFactoryOrder({
        factoryId: FACTORY,
        onChanged,
        onAddOptimistic,
      }),
    { wrapper: wrapper(mocks) }
  );
  act(() => result.current.handleClose(true));
  return { result, onChanged, onAddOptimistic };
};

beforeEach(() => {
  vi.clearAllMocks();
  assignments.nodes = [assignment("a1", "c1")];
});

describe("useImportFactoryOrder — antes do arquivo", () => {
  it("preencher os dados NÃO cria pedido nenhum", async () => {
    // O pedido nasce só na confirmação final da importação: desistir no meio
    // não pode deixar um rascunho órfão na lista.
    const { result, onAddOptimistic } = run([]);

    act(() => result.current.handleDetailsValid(form()));

    expect(result.current.deferred).not.toBeNull();
    expect(onAddOptimistic).not.toHaveBeenCalled();
  });

  it("voltar do wizard devolve o formulário preenchido", async () => {
    const { result } = run([]);

    act(() => result.current.handleDetailsValid(form()));
    act(() => result.current.goToLeadingStep());

    expect(result.current.deferred).toBeNull();
    expect(result.current.detailsDraft).toMatchObject({
      orderDate: "2026-09-12",
    });
  });

  it("vínculo que não existe mais não avança", () => {
    const { result } = run([]);

    act(() =>
      result.current.handleDetailsValid(form({ assignment: { value: "a9" } }))
    );

    expect(result.current.deferred).toBeNull();
  });

  it("leva o IPI da fábrica para o wizard", () => {
    // É o que decide se o imposto entra por fora no pedido importado.
    const { result } = run([]);

    expect(result.current.ipiInOrder).toBe(true);
  });
});

describe("useImportFactoryOrder — criar na confirmação", () => {
  it("o pedido nasce quando o wizard confirma", async () => {
    const { result, onAddOptimistic } = run([createMock()]);
    act(() => result.current.handleDetailsValid(form()));

    let id: string | undefined;
    await act(async () => {
      id = await result.current.deferred!.createOrder();
    });

    expect(id).toBe("o-novo");
    expect(onAddOptimistic).toHaveBeenCalledWith(
      expect.objectContaining({ id: "o-novo", notes: null })
    );
  });

  it("tentar de novo não cria um segundo pedido", async () => {
    // Sem a memória do id, uma falha na gravação dos itens faria a re-tentativa
    // duplicar o pedido na fábrica.
    const { result, onAddOptimistic } = run([createMock()]);
    act(() => result.current.handleDetailsValid(form()));

    await act(async () => {
      await result.current.deferred!.createOrder();
      await result.current.deferred!.createOrder();
    });

    expect(onAddOptimistic).toHaveBeenCalledOnce();
  });

  it("recusa do backend não inventa pedido na aba", async () => {
    const { result, onAddOptimistic } = run([createMock(false)]);
    act(() => result.current.handleDetailsValid(form()));

    await expect(result.current.deferred!.createOrder()).rejects.toThrow(
      "Cliente negativado"
    );
    expect(onAddOptimistic).not.toHaveBeenCalled();
  });
});

describe("useImportFactoryOrder — fechar", () => {
  it("não fecha no meio da importação", () => {
    const { result } = run([]);

    act(() => result.current.setIsBusy(true));
    act(() => result.current.handleClose(false));

    expect(result.current.open).toBe(true);
  });

  it("fechar depois de criar recarrega a lista", async () => {
    const { result, onChanged } = run([createMock()]);
    act(() => result.current.handleDetailsValid(form()));
    await act(async () => {
      await result.current.deferred!.createOrder();
    });

    act(() => result.current.handleClose(false));

    expect(onChanged).toHaveBeenCalledOnce();
    expect(result.current.open).toBe(false);
  });

  it("fechar sem ter criado nada não mexe na lista", () => {
    const { result, onChanged } = run([]);

    act(() => result.current.handleClose(false));

    expect(onChanged).not.toHaveBeenCalled();
  });
});
