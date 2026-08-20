import { describe, expect, it } from "vitest";
import { buildAddress } from "../utils";
import type { ClientData } from "./interface";

/**
 * `buildAddress` mora no PAI da aba (`clients/[id]/utils.ts`) — é essa a função
 * que a Visão Geral chama.
 *
 * Havia aqui uma segunda `buildAddress`, num `overview/utils.ts` que tela
 * nenhuma importava, e este teste cobria essa cópia. As duas divergiam no
 * bairro e no CEP: o teste afirmava, com um caso dedicado, que o bairro NÃO
 * entra no endereço — enquanto a função de verdade o escreve. Cobertura sobre
 * código morto é pior do que nenhuma: ela responde pela tela sem passar por ela.
 */

/** Cliente com todos os campos de endereço nulos — sobrescreva por teste. */
const makeClient = (overrides: Partial<ClientData> = {}): ClientData => ({
  id: "1",
  cnpj: "00.000.000/0001-00",
  razaoSocial: "Empresa Teste LTDA",
  nomeFantasia: null,
  cnae: "4711-3/02",
  cnaeDescription: null,
  addressStreet: null,
  addressNumber: null,
  addressComplement: null,
  addressNeighborhood: null,
  addressZip: null,
  addressCity: null,
  addressState: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  companyClient: null,
  ...overrides,
});

describe("buildAddress", () => {
  it("devolve travessão quando não há endereço nenhum", () => {
    expect(buildAddress(makeClient())).toBe("—");
  });

  it("devolve travessão quando os campos vêm como texto vazio", () => {
    const client = makeClient({
      addressStreet: "",
      addressNumber: "",
      addressComplement: "",
      addressNeighborhood: "",
      addressCity: "",
      addressState: "",
      addressZip: "",
    });
    expect(buildAddress(client)).toBe("—");
  });

  it("escreve o endereço inteiro, com bairro e CEP por extenso", () => {
    const client = makeClient({
      addressStreet: "Rua das Flores",
      addressNumber: "123",
      addressComplement: "Apto 4",
      addressNeighborhood: "Centro",
      addressCity: "São Paulo",
      addressState: "SP",
      addressZip: "01310-100",
    });
    expect(buildAddress(client)).toBe(
      "Rua das Flores, 123, Apto 4, Bairro Centro, São Paulo / SP, CEP 01310-100"
    );
  });

  it("pula as partes ausentes e junta o resto", () => {
    const client = makeClient({
      addressStreet: "Av. Brasil",
      addressNumber: "500",
      addressCity: "Rio de Janeiro",
      addressState: "RJ",
    });
    expect(buildAddress(client)).toBe("Av. Brasil, 500, Rio de Janeiro / RJ");
  });

  // Cidade e estado saem juntos numa parte só ("São Paulo / SP"): com um deles
  // ausente, o que sobrou aparece sozinho, sem a barra pendurada.
  it("escreve a cidade sozinha quando falta o estado", () => {
    const client = makeClient({
      addressStreet: "Rua X",
      addressCity: "Curitiba",
    });
    expect(buildAddress(client)).toBe("Rua X, Curitiba");
  });

  it("escreve o estado sozinho quando falta a cidade", () => {
    expect(buildAddress(makeClient({ addressState: "MG" }))).toBe("MG");
  });

  it("funciona com um campo só", () => {
    expect(buildAddress(makeClient({ addressCity: "Belo Horizonte" }))).toBe(
      "Belo Horizonte"
    );
  });
});
