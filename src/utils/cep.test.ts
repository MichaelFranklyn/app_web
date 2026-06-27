import { afterEach, describe, expect, it, vi } from "vitest";

import { createCepAutofill, fetchAddressByCep } from "./cep";

afterEach(() => {
  vi.unstubAllGlobals();
});

const viaCep = (body: Record<string, unknown>) =>
  vi.fn(async () => ({ json: async () => body }));

describe("fetchAddressByCep", () => {
  it("retorna null se não tiver 8 dígitos", async () => {
    expect(await fetchAddressByCep("123")).toBeNull();
  });

  it("mapeia a resposta do ViaCEP", async () => {
    vi.stubGlobal(
      "fetch",
      viaCep({
        logradouro: "Rua X",
        bairro: "Centro",
        localidade: "São Paulo",
        uf: "SP",
      })
    );
    expect(await fetchAddressByCep("01310-100")).toEqual({
      street: "Rua X",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
    });
  });

  it("retorna null quando o CEP não existe (erro: true)", async () => {
    vi.stubGlobal("fetch", viaCep({ erro: true }));
    expect(await fetchAddressByCep("00000-000")).toBeNull();
  });

  it("retorna null se a requisição lança", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network");
      })
    );
    expect(await fetchAddressByCep("01310100")).toBeNull();
  });
});

describe("createCepAutofill", () => {
  it("preenche os 4 campos mapeados", async () => {
    vi.stubGlobal(
      "fetch",
      viaCep({ logradouro: "R", bairro: "B", localidade: "C", uf: "UF" })
    );
    const setValue = vi.fn();
    const handler = createCepAutofill({
      street: "homeStreet",
      neighborhood: "homeNeighborhood",
      city: "homeCity",
      state: "homeState",
    });
    await handler("01310100", setValue);

    expect(setValue).toHaveBeenCalledWith("homeStreet", "R");
    expect(setValue).toHaveBeenCalledWith("homeState", "UF");
    expect(setValue).toHaveBeenCalledTimes(4);
  });

  it("não preenche nada quando o endereço é nulo", async () => {
    const setValue = vi.fn();
    const handler = createCepAutofill({
      street: "s",
      neighborhood: "n",
      city: "c",
      state: "st",
    });
    await handler("123", setValue);
    expect(setValue).not.toHaveBeenCalled();
  });
});
