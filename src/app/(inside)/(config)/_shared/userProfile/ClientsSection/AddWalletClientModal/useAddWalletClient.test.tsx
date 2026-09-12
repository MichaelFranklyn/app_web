import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * As quatro leituras do modal (acessos do vendedor, fábricas da empresa,
 * vínculos existentes e níveis) e a busca de clientes têm hooks próprios: aqui
 * entram como dublês, para o que se prende ser a decisão da carteira.
 */
const { user, data, clients, assignment } = vi.hoisted(() => ({
  user: { isSeller: false },
  data: {
    accesses: [] as unknown[],
    companyFactories: [] as unknown[],
    links: [] as unknown[],
    tiers: [] as unknown[],
  },
  clients: {
    nodes: [] as unknown[],
    loading: false,
    onSearch: undefined as undefined | (() => void),
  },
  assignment: { currentSellerName: null as string | null, isTakeover: false },
}));

vi.mock("@/hooks/useUserData", () => ({ useUserData: () => user }));
vi.mock("@/hooks/useAsyncSelectOptions", () => ({
  useAsyncSelectOptions: () => clients,
}));
vi.mock("@/hooks/useClientFactoryAssignment", () => ({
  useClientFactoryAssignment: () => assignment,
}));
vi.mock("@/hooks/useCompleteList", () => ({
  // Cada uma das quatro listas é reconhecida pelo nome da operação.
  useCompleteList: (query: unknown) => {
    const name = JSON.stringify(query);
    if (name.includes("WalletSellerFactoryAccesses")) {
      return {
        data: {
          sellerFactoryAccessList: {
            edges: data.accesses.map((node) => ({ node })),
          },
        },
        error: undefined,
      };
    }
    if (name.includes("WalletCompanyFactories")) {
      return {
        data: {
          companyFactories: {
            edges: data.companyFactories.map((node) => ({ node })),
          },
        },
        error: undefined,
      };
    }
    if (name.includes("WalletExistingLinks")) {
      return {
        data: {
          sellerClientFactoryList: {
            edges: data.links.map((node) => ({ node })),
          },
        },
        error: undefined,
      };
    }
    return {
      data: { priceTiers: { edges: data.tiers.map((node) => ({ node })) } },
      error: undefined,
    };
  },
}));

import { Toast } from "@/components/Toast";
import { CREATE_SELLER_CLIENT_FACTORY_MUTATION } from "./gql";
import { useAddWalletClient } from "./useAddWalletClient";

const SELLER = "s1";

const linkMock = (
  input: Record<string, unknown>,
  ok = true,
  message = "Cliente adicionado"
) => ({
  request: {
    query: CREATE_SELLER_CLIENT_FACTORY_MUTATION,
    variables: { input },
  },
  result: {
    data: {
      createSellerClientFactory: {
        __typename: "SellerClientFactoryResponse",
        status: ok,
        message,
        data: ok
          ? { __typename: "SellerClientFactoryType", id: "scf-1" }
          : null,
      },
    },
  },
});

const baseInput = {
  sellerId: SELLER,
  factoryId: "f1",
  clientId: "c1",
  priceTierId: "t1",
  transferFromCurrentSeller: false,
};

const form = (extra: Record<string, unknown> = {}) => ({
  factoryId: { value: "f1" },
  clientId: { value: "c1" },
  priceTierId: { value: "t1" },
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
  onChange?: (
    value: unknown,
    setValue: (n: string, v: unknown) => void
  ) => void;
};

const run = (mocks: unknown[] = []) => {
  const onAdded = vi.fn();
  const { result } = renderHook(
    () => useAddWalletClient({ sellerId: SELLER, onAdded }),
    { wrapper: wrapper(mocks) }
  );
  act(() => result.current.handleClose(true));
  return { result, onAdded };
};

const field = (
  result: ReturnType<typeof run>["result"],
  name: string
): TestField =>
  result.current.steps[0].sections[0].fields.find(
    (f) => f.name === name
  )! as TestField;

/** Escolhe a fábrica como a tela faria (ela destrava cliente e nível). */
const chooseFactory = (
  result: ReturnType<typeof run>["result"],
  factoryId: string
) => {
  const setValue = vi.fn();
  act(() =>
    field(result, "factoryId").onChange?.({ value: factoryId }, setValue)
  );
  return setValue;
};

beforeEach(() => {
  vi.clearAllMocks();
  user.isSeller = false;
  assignment.isTakeover = false;
  assignment.currentSellerName = null;
  data.accesses = [
    {
      isActive: true,
      factoryId: "f1",
      factory: { id: "f1", nomeFantasia: "HERC", razaoSocial: "HERC SA" },
    },
  ];
  data.companyFactories = [{ id: "cf1", factoryId: "f1" }];
  data.links = [];
  data.tiers = [{ id: "t1", name: "Platina" }];
  clients.nodes = [
    {
      id: "cc1",
      isActive: true,
      client: { id: "c1", razaoSocial: "ALTO", nomeFantasia: null },
    },
    {
      id: "cc2",
      isActive: true,
      client: { id: "c2", razaoSocial: "ZETA", nomeFantasia: null },
    },
  ];
});

describe("useAddWalletClient — as opções", () => {
  it("só oferece fábricas às quais o vendedor tem acesso", () => {
    const { result } = run();

    expect(field(result, "factoryId").options).toEqual([
      { value: "f1", label: "HERC" },
    ]);
  });

  it("vendedor sem acesso a fábrica nenhuma é avisado do que falta", () => {
    data.accesses = [];
    const { result } = run();

    expect(field(result, "factoryId").placeholder).toBe(
      "Dê acesso a uma fábrica primeiro"
    );
  });

  it("cliente e nível só destravam depois da fábrica", () => {
    const { result } = run();

    expect(field(result, "clientId").placeholder).toBe(
      "Selecione a fábrica primeiro"
    );
    expect(field(result, "priceTierId").placeholder).toBe(
      "Selecione a fábrica primeiro"
    );
  });

  it("trocar de fábrica limpa cliente e nível já escolhidos", () => {
    // O nível é da fábrica: manter o anterior mandaria um nível de outra.
    const { result } = run();

    const setValue = chooseFactory(result, "f1");

    expect(setValue).toHaveBeenCalledWith("clientId", null);
    expect(setValue).toHaveBeenCalledWith("priceTierId", null);
  });

  it("quem já está na carteira daquela fábrica sai da lista", () => {
    // Oferecer de novo só produziria o erro de vínculo duplicado.
    data.links = [{ factoryId: "f1", clientId: "c1" }];
    const { result } = run();
    chooseFactory(result, "f1");

    expect(field(result, "clientId").options?.map((o) => o.value)).toEqual([
      "c2",
    ]);
  });

  it("o mesmo cliente noutra fábrica continua disponível", () => {
    data.links = [{ factoryId: "f2", clientId: "c1" }];
    const { result } = run();
    chooseFactory(result, "f1");

    expect(field(result, "clientId").options).toHaveLength(2);
  });
});

describe("useAddWalletClient — adicionar", () => {
  it("cliente livre entra direto na carteira", async () => {
    const { result, onAdded } = run([linkMock(baseInput)]);

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(onAdded).toHaveBeenCalledOnce());
    expect(result.current.open).toBe(false);
  });

  it("formulário incompleto é recusado antes do servidor", async () => {
    const { result, onAdded } = run([]);

    await act(() => result.current.handleSubmit(form({ priceTierId: null })));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("recusa do backend mantém o modal aberto", async () => {
    const { result, onAdded } = run([
      linkMock(baseInput, false, "Vendedor sem acesso à fábrica"),
    ]);

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onAdded).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
  });
});

describe("useAddWalletClient — cliente de outro vendedor", () => {
  it("pede confirmação em vez de transferir na surdina", async () => {
    // Cada par cliente+fábrica tem um responsável só: salvar seria transferir.
    assignment.isTakeover = true;
    assignment.currentSellerName = "Bruna";
    const { result, onAdded } = run([]);

    await act(() => result.current.handleSubmit(form()));

    expect(result.current.confirmOpen).toBe(true);
    expect(result.current.currentSellerName).toBe("Bruna");
    expect(result.current.open).toBe(false);
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("confirmando, o mesmo formulário vai autorizando a troca", async () => {
    assignment.isTakeover = true;
    const { result, onAdded } = run([
      linkMock({ ...baseInput, transferFromCurrentSeller: true }),
    ]);

    await act(() => result.current.handleSubmit(form()));
    await act(() => result.current.confirmTransfer());

    await waitFor(() => expect(onAdded).toHaveBeenCalledOnce());
  });

  it("desistir devolve o formulário preenchido", async () => {
    assignment.isTakeover = true;
    const { result } = run([]);

    await act(() => result.current.handleSubmit(form()));
    act(() => result.current.closeConfirm());

    expect(result.current.confirmOpen).toBe(false);
    expect(result.current.initialData).toMatchObject({
      clientId: { value: "c1" },
    });
  });

  it("vendedor não toma a carteira de um colega", async () => {
    user.isSeller = true;
    assignment.isTakeover = true;
    const { result, onAdded } = run([]);

    await act(() => result.current.handleSubmit(form()));

    expect(result.current.canTransfer).toBe(false);
    expect(result.current.confirmOpen).toBe(false);
    expect(onAdded).not.toHaveBeenCalled();
  });
});
