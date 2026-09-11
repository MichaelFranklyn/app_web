import { beforeEach, describe, expect, it, vi } from "vitest";

import { executeServerQueries } from "./getDataServer";

const { gqlFetch, getServerCookie, parseJwtServer, unstableCache } = vi.hoisted(
  () => ({
    gqlFetch: vi.fn(),
    getServerCookie: vi.fn(),
    parseJwtServer: vi.fn(),
    unstableCache: vi.fn(),
  })
);

vi.mock("./gqlFetch", () => ({ gqlFetch }));
vi.mock("@/utils/cookies/serverCookie", () => ({ getServerCookie }));
vi.mock("@/utils/auth/jwt", () => ({ parseJwtServer }));

// O Data Cache do Next não roda fora do servidor: o duble executa a função e
// guarda a chave e as opções, que é o que importa aqui — a chave é o que
// separa o cache de um usuário do de outro.
vi.mock("next/cache", () => ({
  unstable_cache: unstableCache,
}));

/** Chamadas registradas no `unstable_cache`: [fn, chave, opções]. */
const registros = () =>
  unstableCache.mock.calls as unknown as [
    (token: string | null) => Promise<unknown>,
    string[],
    { tags: string[]; revalidate: number | false },
  ][];

const QUERY = { query: "query Clients { clients { id } }" };

beforeEach(() => {
  gqlFetch.mockReset();
  getServerCookie.mockReset().mockResolvedValue("token-do-cookie");
  parseJwtServer.mockReset().mockReturnValue({ sub: "user-1" });
  unstableCache
    .mockReset()
    .mockImplementation((fn: (token: string | null) => Promise<unknown>) => fn);
});

describe("executeServerQueries", () => {
  it("devolve um objeto com a mesma chave de cada consulta", async () => {
    gqlFetch.mockResolvedValue({
      data: { clients: { edges: [], totalCount: 0 } },
    });

    const result = await executeServerQueries<{ clients: unknown }>({
      clients: QUERY,
    });

    expect(result).toHaveProperty("clients");
  });

  it("desembrulha o envelope DataResponse do backend", async () => {
    // O que a página quer é o `data`; o envelope é protocolo.
    gqlFetch.mockResolvedValue({
      data: {
        my_company: {
          status: true,
          code: 200,
          message: "ok",
          data: { id: "c-1", nomeFantasia: "Empresa" },
        },
      },
    });

    const result = await executeServerQueries<{ my_company: unknown }>({
      my_company: QUERY,
    });

    expect(result.my_company).toEqual({ id: "c-1", nomeFantasia: "Empresa" });
  });

  it("envelope com status falso vira exceção com a mensagem do backend", async () => {
    gqlFetch.mockResolvedValue({
      data: {
        my_company: {
          status: false,
          code: 403,
          message: "Acesso negado",
          data: null,
        },
      },
    });

    await expect(executeServerQueries({ my_company: QUERY })).rejects.toThrow(
      "Acesso negado"
    );
  });

  it("conexão paginada vai inteira: a página precisa do pageInfo", async () => {
    const connection = {
      edges: [{ node: { id: "1" } }],
      pageInfo: { hasNextPage: false, endCursor: null },
      totalCount: 1,
    };
    gqlFetch.mockResolvedValue({ data: { clients_list: connection } });

    const result = await executeServerQueries<{ clients: unknown }>({
      clients: QUERY,
    });

    expect(result.clients).toEqual(connection);
  });

  it("acha o campo mesmo quando o apelido da query não é a chave", async () => {
    // As queries usam alias (`clients_list: clients`), e a chave do objeto é a
    // da PÁGINA: cair no primeiro campo é o que mantém as duas independentes.
    gqlFetch.mockResolvedValue({
      data: { clients_list: { edges: [], totalCount: 0 } },
    });

    const result = await executeServerQueries<{ qualquerNome: unknown }>({
      qualquerNome: QUERY,
    });

    expect(result.qualquerNome).toEqual({ edges: [], totalCount: 0 });
  });

  it("resposta sem data devolve nulo para aquela chave", async () => {
    gqlFetch.mockResolvedValue({ data: null });

    const result = await executeServerQueries<{ clients: unknown }>({
      clients: QUERY,
    });

    expect(result.clients).toBeNull();
  });

  it("busca as consultas em paralelo, não uma depois da outra", async () => {
    gqlFetch.mockResolvedValue({ data: { a: 1 } });

    await executeServerQueries({ um: QUERY, dois: QUERY, tres: QUERY });

    expect(gqlFetch).toHaveBeenCalledTimes(3);
  });

  it("o token sai do cookie FORA do cache e entra como argumento", async () => {
    // Lê-lo dentro do `unstable_cache` guardaria o token na entrada do cache.
    gqlFetch.mockResolvedValue({ data: { clients: null } });

    await executeServerQueries({ clients: QUERY });

    expect(gqlFetch).toHaveBeenCalledWith(QUERY, "token-do-cookie");
  });

  it("a chave do cache separa usuário, consulta e variáveis", async () => {
    gqlFetch.mockResolvedValue({ data: { clients: null } });

    await executeServerQueries({
      clients: { ...QUERY, variables: { page: 2 } },
    });

    const [, chave, opcoes] = registros()[0]!;
    expect(chave).toEqual(["clients", "user-1", JSON.stringify({ page: 2 })]);
    expect(opcoes.tags).toEqual(["global", "user-user-1"]);
  });

  it("sem sessão, o cache é o do anônimo — e não o do último que passou", async () => {
    getServerCookie.mockResolvedValue(null);
    gqlFetch.mockResolvedValue({ data: { clients: null } });

    await executeServerQueries({ clients: QUERY });

    expect(parseJwtServer).not.toHaveBeenCalled();
    expect(registros()[0]![1]).toContain("anon");
    expect(gqlFetch).toHaveBeenCalledWith(QUERY, null);
  });

  it("por padrão o dado vale 1 segundo: junta a rajada, não poupa visitas", async () => {
    gqlFetch.mockResolvedValue({ data: { clients: null } });

    await executeServerQueries({ clients: QUERY });

    expect(registros()[0]![2].revalidate).toBe(1);
  });

  it("rótulos e validade declarados pela página são respeitados", async () => {
    gqlFetch.mockResolvedValue({ data: { clients: null } });

    await executeServerQueries({
      clients: { ...QUERY, cache: { tags: ["clients"], revalidate: 60 } },
    });

    const [, , opcoes] = registros()[0]!;
    expect(opcoes.tags).toEqual(["global", "user-user-1", "clients"]);
    expect(opcoes.revalidate).toBe(60);
  });
});
