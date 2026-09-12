import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * As opções (vendedores, fábricas, níveis) e a leitura de "quem atende hoje"
 * têm hooks próprios: aqui são dublês, para o que se prende ser a coreografia
 * do vínculo — inclusive a transferência de carteira.
 */
const { user, options, assignment } = vi.hoisted(() => ({
  user: { isSeller: false, sellerId: null as string | null },
  options: {
    sellerOptions: [
      { value: "s1", label: "Rafael" },
      { value: "s2", label: "Bruna" },
    ],
    factoryOptions: [{ value: "f1", label: "HERC" }],
    tierOptions: [{ value: "t1", label: "Platina" }],
  },
  assignment: {
    currentSellerName: null as string | null,
    isTakeover: false,
  },
}));

vi.mock("@/hooks/useUserData", () => ({ useUserData: () => user }));
vi.mock("./useLinkFactoryOptions", () => ({
  useLinkFactoryOptions: () => options,
}));
vi.mock("@/hooks/useClientFactoryAssignment", () => ({
  useClientFactoryAssignment: () => assignment,
}));

import { Toast } from "@/components/Toast";
import { CREATE_SELLER_CLIENT_FACTORY_MUTATION } from "./gql";
import { useLinkFactory } from "./useLinkFactory";

const CLIENT = "c1";

const linkMock = (
  input: Record<string, unknown>,
  ok = true,
  message = "Vínculo criado"
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
  clientId: CLIENT,
  sellerId: "s1",
  factoryId: "f1",
  priceTierId: "t1",
  transferFromCurrentSeller: false,
};

const form = (extra: Record<string, unknown> = {}) => ({
  sellerId: { value: "s1" },
  factoryId: { value: "f1" },
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
  const onSuccess = vi.fn();
  const { result } = renderHook(
    () => useLinkFactory({ clientId: CLIENT, onSuccess }),
    { wrapper: wrapper(mocks) }
  );
  return { result, onSuccess };
};

const fields = (result: ReturnType<typeof run>["result"]) =>
  result.current.formSteps[0].sections[0].fields.map((f) => f.name);

beforeEach(() => {
  vi.clearAllMocks();
  user.isSeller = false;
  user.sellerId = null;
  assignment.isTakeover = false;
  assignment.currentSellerName = null;
});

describe("useLinkFactory — o formulário", () => {
  it("gestor escolhe o vendedor; o vendedor não vê o campo", () => {
    // O vendedor só vincula a si mesmo — o backend também força isso.
    expect(fields(run().result)).toContain("sellerId");

    user.isSeller = true;
    user.sellerId = "s1";
    expect(fields(run().result)).not.toContain("sellerId");
  });

  it("trocar de vendedor limpa a fábrica; trocar de fábrica limpa o nível", () => {
    const { result } = run();
    const setValue = vi.fn();
    const field = (name: string) =>
      result.current.formSteps[0].sections[0].fields.find(
        (f) => f.name === name
      )!;

    act(() => field("sellerId").onChange?.({ value: "s1" }, setValue));
    expect(setValue).toHaveBeenCalledWith("factoryId", null);

    act(() => field("factoryId").onChange?.({ value: "f1" }, setValue));
    expect(setValue).toHaveBeenCalledWith("priceTierId", null);
  });

  it("sem vendedor escolhido, a fábrica diz o que falta", () => {
    const { result } = run();
    const factory = result.current.formSteps[0].sections[0].fields.find(
      (f) => f.name === "factoryId"
    )!;

    expect(factory.placeholder).toBe("Selecione um vendedor primeiro");
  });
});

describe("useLinkFactory — criar o vínculo", () => {
  it("fábrica livre vira vínculo direto", async () => {
    const { result, onSuccess } = run([linkMock(baseInput)]);

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(result.current.open).toBe(false);
  });

  it("vendedor logado entra como dono do vínculo, sem campo na tela", async () => {
    user.isSeller = true;
    user.sellerId = "s9";
    const { result, onSuccess } = run([
      linkMock({ ...baseInput, sellerId: "s9" }),
    ]);

    await act(() => result.current.handleSubmit(form({ sellerId: null })));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("prioridade e frequência entram só quando foram preenchidas", async () => {
    const { result, onSuccess } = run([
      linkMock({
        ...baseInput,
        priority: "alta",
        visitFrequencyDays: 30,
      }),
    ]);

    await act(() =>
      result.current.handleSubmit(
        form({ priority: { value: "alta" }, visitFrequencyDays: "30" })
      )
    );

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it("recusa do backend mantém o formulário para corrigir", async () => {
    const { result, onSuccess } = run([
      linkMock(baseInput, false, "Cliente já vinculado"),
    ]);
    act(() => result.current.handleOpenChange(true));

    await act(() => result.current.handleSubmit(form()));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.open).toBe(true);
  });
});

describe("useLinkFactory — carteira de outro vendedor", () => {
  it("salvar num vínculo de colega pede confirmação em vez de criar", async () => {
    // Cada cliente tem UM vendedor por fábrica: salvar aqui transfere o
    // atendimento, e isso precisa ser dito antes, não virar erro no fim.
    assignment.isTakeover = true;
    assignment.currentSellerName = "Bruna";
    const { result, onSuccess } = run([]);
    act(() => result.current.handleOpenChange(true));

    await act(() => result.current.handleSubmit(form()));

    expect(result.current.confirmOpen).toBe(true);
    expect(result.current.currentSellerName).toBe("Bruna");
    expect(onSuccess).not.toHaveBeenCalled();
    // Modal sobre modal é proibido: o formulário sai de cena.
    expect(result.current.open).toBe(false);
  });

  it("desistir devolve o formulário com o que estava preenchido", async () => {
    assignment.isTakeover = true;
    const { result } = run([]);

    await act(() => result.current.handleSubmit(form()));
    act(() => result.current.closeConfirm());

    expect(result.current.confirmOpen).toBe(false);
    expect(result.current.initialData).toMatchObject({
      factoryId: { value: "f1" },
    });
  });

  it("confirmando, o mesmo formulário vai de novo autorizando a troca", async () => {
    assignment.isTakeover = true;
    const { result, onSuccess } = run([
      linkMock({ ...baseInput, transferFromCurrentSeller: true }),
    ]);

    await act(() => result.current.handleSubmit(form()));
    await act(() => result.current.confirmTransfer());

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(result.current.confirmOpen).toBe(false);
  });

  it("vendedor não toma a carteira de um colega", async () => {
    // A decisão é do gestor (o backend também barra).
    user.isSeller = true;
    user.sellerId = "s1";
    assignment.isTakeover = true;
    const { result, onSuccess } = run([]);

    await act(() => result.current.handleSubmit(form()));

    expect(result.current.canTransfer).toBe(false);
    expect(result.current.confirmOpen).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("transferência recusada não fecha a confirmação como se tivesse dado certo", async () => {
    assignment.isTakeover = true;
    const { result, onSuccess } = run([
      linkMock(
        { ...baseInput, transferFromCurrentSeller: true },
        false,
        "Vendedor sem acesso à fábrica"
      ),
    ]);

    await act(() => result.current.handleSubmit(form()));
    await expect(result.current.confirmTransfer()).rejects.toThrow(
      "Vendedor sem acesso à fábrica"
    );

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
