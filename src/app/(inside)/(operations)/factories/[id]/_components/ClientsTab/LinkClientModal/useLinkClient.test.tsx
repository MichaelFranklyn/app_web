import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * As três leituras que alimentam o modal (carteira da empresa, vendedores com
 * acesso, vínculos existentes) têm hooks próprios, com testes próprios: aqui
 * entram como dublês para o que se prende ser a decisão do vínculo.
 */
const { user, clients, accesses, links, tiers } = vi.hoisted(() => ({
  user: { isSeller: false },
  clients: {
    nodes: [] as unknown[],
    loading: false,
    onSearch: undefined as undefined | (() => void),
  },
  accesses: { nodes: [] as unknown[], error: undefined },
  links: { nodes: [] as unknown[], error: undefined },
  tiers: { data: undefined as unknown, error: undefined },
}));

vi.mock("@/hooks/useUserData", () => ({ useUserData: () => user }));
vi.mock("@/hooks/useAsyncSelectOptions", () => ({
  useAsyncSelectOptions: () => clients,
}));
vi.mock("@/hooks/useAllPages", () => ({
  // O modal faz duas varreduras: acessos e vínculos. A query diz qual é qual.
  useAllPages: (query: { definitions?: unknown }) => {
    const name = JSON.stringify(query).includes("SellersWithAccess")
      ? "access"
      : "links";
    return name === "access" ? accesses : links;
  },
}));
vi.mock("@/hooks/useCompleteList", () => ({
  useCompleteList: () => tiers,
}));

import { Toast } from "@/components/Toast";
import { CREATE_SELLER_CLIENT_FACTORY_MUTATION } from "./gql";
import { useLinkClient } from "./useLinkClient";

const FACTORY = "f1";
const COMPANY_FACTORY = "cf1";

const clientNode = (id: string, name: string) => ({
  id: `cc-${id}`,
  isActive: true,
  client: { id, razaoSocial: name, nomeFantasia: null },
});

const accessNode = (sellerId: string, name: string) => ({
  isActive: true,
  seller: { id: sellerId, name },
});

const linkNode = (clientId: string, sellerId: string, sellerName: string) => ({
  clientId,
  sellerId,
  seller: { id: sellerId, name: sellerName },
});

const linkMock = (
  input: Record<string, unknown>,
  ok = true,
  message = "Cliente vinculado"
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
        code: ok ? 201 : 400,
        message,
        data: ok
          ? { __typename: "SellerClientFactoryType", id: "scf-1" }
          : null,
      },
    },
  },
});

const baseInput = {
  clientId: "c1",
  sellerId: "s1",
  factoryId: FACTORY,
  priceTierId: "t1",
  transferFromCurrentSeller: false,
};

const form = (extra: Record<string, unknown> = {}) => ({
  clientId: { value: "c1" },
  sellerId: { value: "s1" },
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

const run = (mocks: unknown[] = []) => {
  const { result } = renderHook(
    () =>
      useLinkClient({
        factoryId: FACTORY,
        companyFactoryId: COMPANY_FACTORY,
      }),
    { wrapper: wrapper(mocks) }
  );
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

/** Escolhe cliente e vendedor como a tela faria. */
const choose = (
  result: ReturnType<typeof run>,
  clientId: string,
  sellerId: string
) => {
  act(() => field(result, "clientId").onChange?.({ value: clientId }, vi.fn()));
  act(() => field(result, "sellerId").onChange?.({ value: sellerId }, vi.fn()));
};

beforeEach(() => {
  vi.clearAllMocks();
  user.isSeller = false;
  clients.nodes = [clientNode("c1", "ALTO"), clientNode("c2", "ZETA")];
  accesses.nodes = [accessNode("s1", "Rafael"), accessNode("s2", "Bruna")];
  links.nodes = [];
  tiers.data = {
    priceTiers: { edges: [{ node: { id: "t1", name: "Platina" } }] },
  };
});

describe("useLinkClient — as opções", () => {
  it("cliente já atendido continua na lista, dizendo por quem", () => {
    // Esconder o cliente deixava a troca impossível pela tela — o vendedor
    // pode ter saído da empresa ou deixado de atender a fábrica.
    links.nodes = [linkNode("c1", "s2", "Bruna")];
    const result = run();

    expect(field(result, "clientId").options?.map((o) => o.label)).toEqual([
      "ALTO — atendido por Bruna",
      "ZETA",
    ]);
  });

  it("só vendedores com acesso à fábrica e níveis dela são oferecidos", () => {
    const result = run();

    expect(field(result, "sellerId").options?.map((o) => o.value)).toEqual([
      "s1",
      "s2",
    ]);
    expect(field(result, "priceTierId").options).toEqual([
      { label: "Platina", value: "t1" },
    ]);
  });

  it("vendedor inativo ou sem cadastro não entra na lista", () => {
    accesses.nodes = [
      accessNode("s1", "Rafael"),
      { isActive: false, seller: { id: "s3", name: "Saiu" } },
      { isActive: true, seller: null },
    ];
    const result = run();

    expect(field(result, "sellerId").options).toHaveLength(1);
  });
});

describe("useLinkClient — vincular", () => {
  it("cliente livre vira vínculo direto", async () => {
    const result = run([linkMock(baseInput)]);
    choose(result, "c1", "s1");

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(result.current.open).toBe(false));
    expect(result.current.isTakeover).toBe(false);
  });

  it("prioridade entra só quando escolhida", async () => {
    const result = run([linkMock({ ...baseInput, priority: "alta" })]);
    choose(result, "c1", "s1");

    await act(() =>
      result.current.handleSubmit(form({ priority: { value: "alta" } }))
    );

    await waitFor(() => expect(result.current.open).toBe(false));
  });

  it("formulário incompleto não chega a chamar o servidor", async () => {
    const result = run([]);
    choose(result, "c1", "s1");

    await act(() => result.current.handleSubmit(form({ priceTierId: null })));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("recusa do backend mantém o modal aberto", async () => {
    const result = run([
      linkMock(baseInput, false, "Vendedor sem acesso à fábrica"),
    ]);
    choose(result, "c1", "s1");

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.open).toBe(true);
  });
});

describe("useLinkClient — transferir o atendimento", () => {
  it("escolher um cliente de outro vendedor pede confirmação", async () => {
    links.nodes = [linkNode("c1", "s2", "Bruna")];
    const result = run([]);
    choose(result, "c1", "s1");

    expect(result.current.isTakeover).toBe(true);
    expect(result.current.currentSellerName).toBe("Bruna");
    expect(result.current.newSellerName).toBe("Rafael");

    await act(() => result.current.handleSubmit(form()));

    expect(result.current.confirmOpen).toBe(true);
    // Modal sobre modal é proibido: o formulário sai de cena.
    expect(result.current.open).toBe(false);
  });

  it("manter o mesmo vendedor não é transferência", () => {
    links.nodes = [linkNode("c1", "s1", "Rafael")];
    const result = run([]);
    choose(result, "c1", "s1");

    expect(result.current.isTakeover).toBe(false);
  });

  it("confirmando, o mesmo formulário vai de novo autorizando a troca", async () => {
    links.nodes = [linkNode("c1", "s2", "Bruna")];
    const result = run([
      linkMock({ ...baseInput, transferFromCurrentSeller: true }),
    ]);
    choose(result, "c1", "s1");

    await act(() => result.current.handleSubmit(form()));
    await act(() => result.current.confirmTransfer());

    await waitFor(() => expect(result.current.confirmOpen).toBe(false));
    expect(result.current.open).toBe(false);
  });

  it("desistir devolve o formulário preenchido", async () => {
    links.nodes = [linkNode("c1", "s2", "Bruna")];
    const result = run([]);
    choose(result, "c1", "s1");

    await act(() => result.current.handleSubmit(form()));
    act(() => result.current.closeConfirm());

    expect(result.current.confirmOpen).toBe(false);
    expect(result.current.initialData).toMatchObject({
      clientId: { value: "c1" },
    });
  });

  it("vendedor não toma a carteira de um colega", async () => {
    user.isSeller = true;
    links.nodes = [linkNode("c1", "s2", "Bruna")];
    const result = run([]);
    choose(result, "c1", "s1");

    await act(() => result.current.handleSubmit(form()));

    expect(result.current.canTransfer).toBe(false);
    expect(result.current.confirmOpen).toBe(false);
  });

  it("transferência recusada não fecha a confirmação", async () => {
    links.nodes = [linkNode("c1", "s2", "Bruna")];
    const result = run([
      linkMock(
        { ...baseInput, transferFromCurrentSeller: true },
        false,
        "Cliente inativo"
      ),
    ]);
    choose(result, "c1", "s1");

    await act(() => result.current.handleSubmit(form()));
    await expect(result.current.confirmTransfer()).rejects.toThrow(
      "Cliente inativo"
    );
  });
});
