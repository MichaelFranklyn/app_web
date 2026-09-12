import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Busca de cliente e listas do cliente têm hooks próprios: aqui são dublês. */
const { clients, factories, orders } = vi.hoisted(() => ({
  clients: {
    options: [{ value: "c1", label: "ALTO" }],
    onSearch: vi.fn(),
    loading: false,
  },
  factories: { nodes: [] as unknown[] },
  orders: { nodes: [] as unknown[] },
}));

vi.mock("@/hooks/useAsyncSelectOptions", () => ({
  useAsyncSelectOptions: () => clients,
}));
vi.mock("@/hooks/useCompleteList", () => ({
  useCompleteList: () => ({
    data: {
      support_client_factories: {
        edges: factories.nodes.map((node) => ({ node })),
      },
    },
    error: undefined,
  }),
}));
vi.mock("@apollo/client/react", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    // Só a lista de pedidos do cliente usa `useQuery` direto neste hook.
    useQuery: () => ({
      data: {
        support_client_orders: {
          edges: orders.nodes.map((node) => ({ node })),
        },
      },
      loading: false,
      error: undefined,
    }),
  };
});

import { Toast } from "@/components/Toast";
import {
  CREATE_SUPPORT_CASE_MUTATION,
  UPDATE_SUPPORT_CASE_MUTATION,
} from "@/graphql/support";
import { SupportCase } from "@/utils/support";
import { useSupportCaseForm } from "./useSupportCaseForm";

const supportCase = (overrides: Partial<SupportCase> = {}): SupportCase =>
  ({
    id: "sc1",
    title: "Mercadoria avariada",
    description: "Duas caixas chegaram molhadas",
    category: "DELIVERY",
    status: "OPEN",
    priority: "HIGH",
    amount: "1500.00",
    reportedAt: "2026-09-01",
    resolvedAt: null,
    resolution: null,
    ageDays: 11,
    isOpen: true,
    clientId: "c1",
    client: { id: "c1", razaoSocial: "ALTO", nomeFantasia: null },
    factory: {
      id: "f1",
      razaoSocial: "HERC SA",
      nomeFantasia: "HERC",
      nickname: null,
    },
    order: null,
    ...overrides,
  }) as SupportCase;

const baseInput = {
  title: "Mercadoria avariada",
  description: "Duas caixas molhadas",
  category: "DELIVERY",
  priority: "HIGH",
  factoryId: "f1",
  orderId: null,
  // `parseAmount` devolve NÚMERO: "1.500,00" → 1500.
  amount: 1500,
  reportedAt: "2026-09-01",
};

const createMock = (input: Record<string, unknown>, ok = true) => ({
  request: { query: CREATE_SUPPORT_CASE_MUTATION, variables: { input } },
  result: {
    data: {
      createClientSupportCase: {
        __typename: "SupportCaseResponse",
        status: ok,
        message: ok ? "Atendimento registrado" : "Cliente inativo",
        data: ok
          ? {
              __typename: "SupportCaseType",
              id: "sc1",
              title: "t",
              status: "OPEN",
            }
          : null,
      },
    },
  },
});

const updateMock = (input: Record<string, unknown>, ok = true) => ({
  request: {
    query: UPDATE_SUPPORT_CASE_MUTATION,
    variables: { id: "sc1", input },
  },
  result: {
    data: {
      updateClientSupportCase: {
        __typename: "SupportCaseResponse",
        status: ok,
        message: ok ? "Atendimento atualizado" : "Caso já encerrado",
        data: ok
          ? {
              __typename: "SupportCaseType",
              id: "sc1",
              title: "t",
              status: "OPEN",
            }
          : null,
      },
    },
  },
});

const form = (extra: Record<string, unknown> = {}) => ({
  title: "  Mercadoria avariada  ",
  description: "Duas caixas molhadas",
  category: { value: "DELIVERY" },
  priority: { value: "HIGH" },
  factoryId: { value: "f1" },
  orderId: null,
  amount: "1.500,00",
  reportedAt: "2026-09-01",
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

type TestField = {
  name: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  onChange?: (value: unknown) => void;
};

const run = (
  mocks: unknown[] = [],
  params: { supportCase?: SupportCase; clientId?: string } = {}
) => {
  const onOpenChange = vi.fn();
  const onSaved = vi.fn();
  const { result } = renderHook(
    () =>
      useSupportCaseForm({
        open: true,
        onOpenChange,
        supportCase: params.supportCase,
        clientId: params.clientId,
        onSaved,
      }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onOpenChange, onSaved };
};

const fields = (result: ReturnType<typeof run>["result"]): TestField[] =>
  result.current.steps[0].sections[0].fields as TestField[];

const field = (result: ReturnType<typeof run>["result"], name: string) =>
  fields(result).find((f) => f.name === name)!;

beforeEach(() => {
  vi.clearAllMocks();
  factories.nodes = [
    {
      id: "scf1",
      factoryId: "f1",
      factory: {
        id: "f1",
        razaoSocial: "HERC SA",
        nomeFantasia: "HERC",
        nickname: null,
      },
    },
  ];
  orders.nodes = [];
});

describe("useSupportCaseForm — de quem é o caso", () => {
  it("na ficha do cliente, o cliente não é perguntado", () => {
    const { result } = run([], { clientId: "c1" });

    expect(fields(result).map((f) => f.name)).not.toContain("clientId");
  });

  it("na fila do escritório, o cliente vem primeiro — fábrica e pedido são dele", () => {
    const { result } = run([]);

    expect(fields(result)[0].name).toBe("clientId");
    expect(field(result, "factoryId").placeholder).toContain(
      "Escolha o cliente primeiro"
    );
  });

  it("escolher o cliente destrava as listas dele", async () => {
    const { result } = run([]);

    act(() => field(result, "clientId").onChange?.({ value: "c1" }));

    await waitFor(() =>
      expect(field(result, "factoryId").options).toHaveLength(1)
    );
  });

  it("editando, o cliente é o do caso e não se troca", () => {
    const { result } = run([], { supportCase: supportCase() });

    expect(fields(result).map((f) => f.name)).not.toContain("clientId");
    expect(result.current.isEditing).toBe(true);
  });
});

describe("useSupportCaseForm — abrir", () => {
  it("caso novo já abre com tipo e urgência padrão, como par do select", () => {
    // String solta deixaria o campo VAZIO na tela com o valor certo por dentro.
    const { result } = run([], { clientId: "c1" });

    expect(result.current.initialValues.category).toMatchObject({
      value: "OTHER",
    });
    expect(result.current.initialValues.priority).toMatchObject({
      value: "NORMAL",
    });
  });

  it("editando, abre com o que o caso já tem", () => {
    const { result } = run([], { supportCase: supportCase() });

    expect(result.current.initialValues).toMatchObject({
      title: "Mercadoria avariada",
      reportedAt: "2026-09-01",
      amount: "1500.00",
    });
    expect(result.current.initialValues.factoryId).toMatchObject({
      value: "f1",
    });
  });
});

describe("useSupportCaseForm — salvar", () => {
  it("registra o caso com o cliente da tela", async () => {
    const { result, onSaved, onOpenChange } = run(
      [createMock({ ...baseInput, clientId: "c1" })],
      { clientId: "c1" }
    );

    await act(() => result.current.submit(form()));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("os selects viajam como id/enum, nunca como objeto", async () => {
    // Mandar o `{ value, label }` cru estourava a mutation inteira.
    const { result, onSaved } = run(
      [createMock({ ...baseInput, clientId: "c1" })],
      { clientId: "c1" }
    );

    await act(() => result.current.submit(form()));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("campos opcionais em branco viram ausência", async () => {
    const { result, onSaved } = run(
      [
        createMock({
          ...baseInput,
          description: null,
          factoryId: null,
          amount: null,
          reportedAt: null,
          clientId: "c1",
        }),
      ],
      { clientId: "c1" }
    );

    await act(() =>
      result.current.submit(
        form({
          description: "   ",
          factoryId: null,
          amount: "",
          reportedAt: "",
        })
      )
    );

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("editando, salva no caso que já existe", async () => {
    const { result, onSaved } = run([updateMock(baseInput)], {
      supportCase: supportCase(),
    });

    await act(() => result.current.submit(form()));

    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
  });

  it("recusa do backend não fecha o modal", async () => {
    const { result, onSaved, onOpenChange } = run(
      [createMock({ ...baseInput, clientId: "c1" }, false)],
      { clientId: "c1" }
    );

    await act(() => result.current.submit(form()));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onSaved).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
