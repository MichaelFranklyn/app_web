import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  buildTakeoverMessage,
  CLIENT_FACTORY_ASSIGNMENT_QUERY,
  useClientFactoryAssignment,
} from "./useClientFactoryAssignment";

const CLIENT = "client-1";
const FACTORY = "factory-1";

const mock = (data: unknown) => ({
  request: {
    query: CLIENT_FACTORY_ASSIGNMENT_QUERY,
    variables: { clientId: CLIENT, factoryId: FACTORY },
  },
  result: { data: { clientFactoryAssignment: { status: true, data } } },
});

const assignedTo = (sellerId: string, name: string) => ({
  id: "scf-1",
  sellerId,
  seller: { id: sellerId, name },
});

const render = (
  params: Parameters<typeof useClientFactoryAssignment>[0],
  mocks: ReturnType<typeof mock>[]
) =>
  renderHook(() => useClientFactoryAssignment(params), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    ),
  });

describe("useClientFactoryAssignment", () => {
  it("fábrica livre para este cliente: não é transferência", async () => {
    const { result } = render(
      { clientId: CLIENT, factoryId: FACTORY, sellerId: "seller-novo" },
      [mock(null)]
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.currentSellerName).toBeNull();
    expect(result.current.isTakeover).toBe(false);
    expect(result.current.isSameSeller).toBe(false);
  });

  it("cliente já é de OUTRO vendedor: salvar significa transferir", async () => {
    const { result } = render(
      { clientId: CLIENT, factoryId: FACTORY, sellerId: "seller-novo" },
      [mock(assignedTo("seller-antigo", "Ana"))]
    );

    await waitFor(() => expect(result.current.isTakeover).toBe(true));
    expect(result.current.currentSellerName).toBe("Ana");
    expect(result.current.isSameSeller).toBe(false);
  });

  it("cliente já é do MESMO vendedor: vincular de novo não faz nada", async () => {
    const { result } = render(
      { clientId: CLIENT, factoryId: FACTORY, sellerId: "seller-1" },
      [mock(assignedTo("seller-1", "Ana"))]
    );

    await waitFor(() => expect(result.current.isSameSeller).toBe(true));
    expect(result.current.isTakeover).toBe(false);
  });

  it("sem fábrica escolhida ainda, não pergunta nada ao backend", async () => {
    // Sem mock: se a query disparasse, o MockedProvider acusaria.
    const { result } = render(
      { clientId: CLIENT, factoryId: null, sellerId: "seller-1" },
      []
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.currentSellerName).toBeNull();
    expect(result.current.isTakeover).toBe(false);
  });

  it("com o modal fechado, não consulta", async () => {
    const { result } = render(
      {
        clientId: CLIENT,
        factoryId: FACTORY,
        sellerId: "seller-1",
        enabled: false,
      },
      []
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isTakeover).toBe(false);
  });

  it("sem vendedor escolhido, ainda não há transferência a anunciar", async () => {
    const { result } = render(
      { clientId: CLIENT, factoryId: FACTORY, sellerId: null },
      [mock(assignedTo("seller-antigo", "Ana"))]
    );

    await waitFor(() => expect(result.current.currentSellerName).toBe("Ana"));
    expect(result.current.isTakeover).toBe(false);
  });
});

describe("buildTakeoverMessage", () => {
  it("diz o que muda e o que fica no histórico", () => {
    const texto = buildTakeoverMessage("Ana", "Bruno");

    expect(texto).toContain(
      "Hoje quem atende este cliente nesta fábrica é Ana"
    );
    expect(texto).toContain("o atendimento passa para Bruno");
    expect(texto).toContain("visitas ainda não realizadas");
    expect(texto).toContain("continuam guardados no histórico");
  });

  it("sem os nomes, não fica com buraco na frase", () => {
    const texto = buildTakeoverMessage(null, null);

    expect(texto).toContain("é outro vendedor");
    expect(texto).toContain("passa para o novo vendedor");
    expect(texto).not.toContain("null");
    expect(texto).not.toContain("undefined");
  });
});
