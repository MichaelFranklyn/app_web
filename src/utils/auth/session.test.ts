import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { deleteSession, postSession } from "./session";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

const resposta = (body: unknown, ok = true) => ({
  ok,
  json: async () => body,
});

describe("postSession", () => {
  it("manda a ação e o payload para a rota de sessão", async () => {
    fetchMock.mockResolvedValue(
      resposta({ status: true, userData: { userId: "u-1" } })
    );

    const result = await postSession(
      { action: "login", input: { email: "a@b.c" }, remember: true },
      "Falhou."
    );

    expect(fetchMock).toHaveBeenCalledWith("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login",
        input: { email: "a@b.c" },
        remember: true,
      }),
    });
    expect(result.userData).toEqual({ userId: "u-1" });
  });

  it("erro do backend vira exceção com a mensagem dele", async () => {
    // É o que o useAsyncAction converte em toast: engolir aqui deixaria o botão
    // voltar ao normal como se tivesse dado certo.
    fetchMock.mockResolvedValue(
      resposta({ status: false, message: "Credenciais inválidas." }, false)
    );

    await expect(
      postSession({ action: "login", input: {} }, "Falhou.")
    ).rejects.toThrow("Credenciais inválidas.");
  });

  it("resposta 200 com status falso também é falha", async () => {
    fetchMock.mockResolvedValue(
      resposta({ status: false, message: "Expirada." })
    );

    await expect(
      postSession({ action: "stopImpersonation" }, "Falhou.")
    ).rejects.toThrow("Expirada.");
  });

  it("sem mensagem do backend, usa o texto de reserva", async () => {
    fetchMock.mockResolvedValue(resposta({ status: false }, false));

    await expect(
      postSession({ action: "signup", input: {} }, "Não foi possível criar.")
    ).rejects.toThrow("Não foi possível criar.");
  });

  it("corpo que não é JSON não estoura um erro sem sentido", async () => {
    // 502 de proxy devolve HTML: o `.json()` rejeita e a pessoa veria
    // "Unexpected token <" em vez do aviso da tela.
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    });

    await expect(
      postSession({ action: "login", input: {} }, "Servidor indisponível.")
    ).rejects.toThrow("Servidor indisponível.");
  });
});

describe("deleteSession", () => {
  it("pede ao servidor para limpar o cookie httpOnly", async () => {
    fetchMock.mockResolvedValue(resposta({ status: true }));

    await deleteSession();

    expect(fetchMock).toHaveBeenCalledWith("/api/session", {
      method: "DELETE",
    });
  });

  it("falhando a rede, não impede a saída", async () => {
    // O chamador segue para /login de qualquer jeito — prender a pessoa numa
    // sessão que ela pediu para encerrar seria pior.
    fetchMock.mockRejectedValue(new Error("offline"));

    await expect(deleteSession()).resolves.toBeUndefined();
  });
});
