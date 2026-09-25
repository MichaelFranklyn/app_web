import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Redes e segmentos vêm de um hook próprio, com teste próprio. */
vi.mock("../../../useClassificationOptions", () => ({
  useClassificationOptions: () => ({
    networkOptions: [{ value: "net1", label: "Rede Alfa" }],
    segmentOptions: [{ value: "seg1", label: "Farmácia" }],
    loading: false,
  }),
}));

import { Toast } from "@/components/Toast";
import { ClientDetail } from "../../interface";
import { UPDATE_COMPANY_CLIENT_MUTATION } from "./gql";
import { useEditClient } from "./useEditClient";

const client = (
  companyClient: Record<string, unknown> | null = {}
): ClientDetail =>
  ({
    id: "c1",
    razaoSocial: "ALTO CONSTRUCAO LTDA",
    nomeFantasia: "Alto",
    companyClient:
      companyClient === null
        ? null
        : {
            id: "cc1",
            isActive: true,
            nickname: null,
            networkId: null,
            segmentId: null,
            network: null,
            segment: null,
            ...companyClient,
          },
  }) as ClientDetail;

const updateMock = (input: Record<string, unknown>, ok = true) => ({
  request: {
    query: UPDATE_COMPANY_CLIENT_MUTATION,
    variables: { id: "cc1", input },
  },
  result: {
    data: {
      updateCompanyClient: {
        __typename: "CompanyClientResponse",
        status: ok,
        message: ok ? "Cliente atualizado" : "Cliente com pedidos abertos",
        data: ok
          ? {
              __typename: "CompanyClientType",
              id: "cc1",
              isActive: true,
              nickname: input.nickname || null,
              networkId: input.networkId ?? null,
              segmentId: input.segmentId ?? null,
              network: null,
              segment: null,
            }
          : null,
      },
    },
  },
});

const form = (extra: Record<string, unknown> = {}) => ({
  nickname: "",
  networkId: null,
  segmentId: null,
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

const run = (mocks: unknown[] = [], detail = client()) => {
  const handlers = {
    onClose: vi.fn(),
    onUpdateOptimistic: vi.fn(),
    onCommit: vi.fn(),
    onRollback: vi.fn(),
  };
  const { result } = renderHook(
    () => useEditClient({ client: detail, open: true, ...handlers }),
    { wrapper: wrapper(mocks) }
  );
  return { result, ...handlers };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useEditClient — abrir", () => {
  it("abre com o apelido e a classificação de hoje", () => {
    const { result } = run(
      [],
      client({
        network: { id: "net1", name: "Rede Alfa" },
        networkId: "net1",
      })
    );

    expect(result.current.initialData).toMatchObject({
      razaoSocial: "ALTO CONSTRUCAO LTDA",
      nickname: "",
      networkId: { value: "net1", label: "Rede Alfa" },
      segmentId: null,
    });
  });

  it("abre com o apelido que a empresa já deu", () => {
    const { result } = run([], client({ nickname: "Mercadinho do Zé" }));

    expect(result.current.initialData.nickname).toBe("Mercadinho do Zé");
  });
});

describe("useEditClient — salvar", () => {
  it("a linha muda na hora e o servidor confirma depois", async () => {
    // Padrão otimista do app: a tela reage antes, e só depois o commit.
    const { result, onUpdateOptimistic, onCommit, onClose } = run([
      updateMock({ nickname: "", networkId: "net1", segmentId: null }),
    ]);

    await act(() =>
      result.current.handleSubmit(form({ networkId: { value: "net1" } }))
    );

    expect(onClose).toHaveBeenCalledOnce();
    expect(onUpdateOptimistic).toHaveBeenCalledWith(
      expect.objectContaining({
        companyClient: expect.objectContaining({
          networkId: "net1",
          network: { id: "net1", name: "Rede Alfa" },
        }),
      })
    );
    await waitFor(() => expect(onCommit).toHaveBeenCalledOnce());
  });

  it("apelido em branco volta ao nome oficial", async () => {
    const { result, onUpdateOptimistic, onCommit } = run(
      [updateMock({ nickname: "", networkId: null, segmentId: null })],
      client({ nickname: "Mercadinho do Zé" })
    );

    await act(() => result.current.handleSubmit(form({ nickname: "   " })));

    expect(onUpdateOptimistic).toHaveBeenCalledWith(
      expect.objectContaining({
        companyClient: expect.objectContaining({ nickname: null }),
      })
    );
    await waitFor(() => expect(onCommit).toHaveBeenCalledOnce());
  });

  it("recusa do servidor devolve a linha ao que era", async () => {
    const { result, onCommit, onRollback } = run([
      updateMock(
        { nickname: "Mercadinho do Zé", networkId: null, segmentId: null },
        false
      ),
    ]);

    await act(() =>
      result.current.handleSubmit(form({ nickname: " Mercadinho do Zé " }))
    );

    await waitFor(() => expect(onRollback).toHaveBeenCalledOnce());
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("select limpo é 'saiu da rede', e não 'não mexi nisso'", async () => {
    // É o único campo em que o nulo explícito tem significado próprio.
    const { result, onCommit } = run(
      [updateMock({ nickname: "", networkId: null, segmentId: null })],
      client({ networkId: "net1", network: { id: "net1", name: "Rede Alfa" } })
    );

    await act(() => result.current.handleSubmit(form({ networkId: "" })));

    await waitFor(() => expect(onCommit).toHaveBeenCalledOnce());
  });

  it("sem mudança nenhuma, só fecha — nem otimismo, nem servidor", async () => {
    const { result, onClose, onUpdateOptimistic } = run([]);

    await act(() => result.current.handleSubmit(form()));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onUpdateOptimistic).not.toHaveBeenCalled();
  });

  it("cliente que não está na carteira não tem o que editar aqui", async () => {
    // Sem `companyClient` não há apelido nem classificação da empresa.
    const { result, onClose, onUpdateOptimistic } = run([], client(null));

    await act(() => result.current.handleSubmit(form()));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onUpdateOptimistic).not.toHaveBeenCalled();
  });
});
