import { gql } from "@apollo/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { gqlFetch, GqlNotFoundError } from "./gqlFetch";

// O endereço da API é lido no CORPO do módulo (o Next o inlina no build), então
// a env precisa estar de pé ANTES do import — e o `vi.hoisted` é justamente o
// que roda antes deles.
const { getServerCookie } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_GRAPHQL_API_HOST = "https://api.girus.test/graphql";
  return { getServerCookie: vi.fn() };
});
vi.mock("@/utils/cookies/serverCookie", () => ({ getServerCookie }));

const fetchMock = vi.fn();

const QUERY = gql`
  query Clients($input: BaseListInput!) {
    clients(input: $input) {
      edges {
        node {
          id
          razaoSocial
        }
      }
      totalCount
    }
  }
`;

const responde = (body: unknown, status = 200) =>
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });

/** O que foi enviado na última chamada: URL e corpo já desserializado. */
const enviado = () => {
  const [uri, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return {
    uri,
    init,
    body: JSON.parse(String(init.body)) as {
      query: string;
      variables?: unknown;
      operationName?: string;
    },
  };
};

beforeEach(() => {
  fetchMock.mockReset();
  getServerCookie.mockReset().mockResolvedValue("token-do-cookie");
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("gqlFetch", () => {
  it("devolve o data da resposta", async () => {
    responde({ data: { clients: { edges: [], totalCount: 0 } } });

    const { data } = await gqlFetch({ query: QUERY, variables: { input: {} } });

    expect(data).toEqual({ clients: { edges: [], totalCount: 0 } });
  });

  it("injeta __typename em toda seleção, como o Apollo faz no navegador", async () => {
    // Sem isso, o resultado do SSR tem shape diferente do que o cache do Apollo
    // espera: semear o cache daria cache-miss e o waterfall de rede voltaria.
    responde({ data: {} });

    await gqlFetch({ query: QUERY });

    const { body } = enviado();
    // Uma vez por seleção: a da operação e as de clients, edges e node.
    expect(body.query.match(/__typename/g)).toHaveLength(4);
  });

  it("não duplica o __typename já escrito no documento", async () => {
    responde({ data: {} });

    await gqlFetch({
      query: gql`
        query Um {
          coisa {
            __typename
            id
          }
        }
      `,
    });

    // Só a seleção da operação ganha o dela; a de `coisa` fica como estava.
    expect(enviado().body.query.match(/__typename/g)).toHaveLength(2);
  });

  it("leva a operação na URL, para o log do backend saber quem chamou", async () => {
    responde({ data: {} });

    await gqlFetch({ query: QUERY });

    expect(enviado().uri).toBe("https://api.girus.test/graphql?op=Clients");
    expect(enviado().body.operationName).toBe("Clients");
  });

  it("aceita a query como texto e ainda descobre o nome da operação", async () => {
    responde({ data: {} });

    await gqlFetch({ query: "mutation CriarPedido { createOrder { id } }" });

    expect(enviado().uri).toContain("?op=CriarPedido");
    // Texto vai como veio: sem documento não há o que visitar.
    expect(enviado().body.query).not.toContain("__typename");
  });

  it("documento anônimo vai sem o parâmetro de operação", async () => {
    responde({ data: {} });

    await gqlFetch({ query: "{ coisa { id } }" });

    expect(enviado().uri).toBe("https://api.girus.test/graphql");
  });

  it("autentica com o token do cookie", async () => {
    responde({ data: {} });

    await gqlFetch({ query: QUERY });

    expect(getServerCookie).toHaveBeenCalledWith("token");
    expect(enviado().init.headers).toEqual(
      expect.objectContaining({ Authorization: "Bearer token-do-cookie" })
    );
  });

  it("token explícito tem precedência sobre o cookie", async () => {
    responde({ data: {} });

    await gqlFetch({ query: QUERY }, "token-do-su");

    expect(getServerCookie).not.toHaveBeenCalled();
    expect(enviado().init.headers).toEqual(
      expect.objectContaining({ Authorization: "Bearer token-do-su" })
    );
  });

  it("token nulo não manda Authorization: é o caso das mutations públicas", async () => {
    responde({ data: {} });

    await gqlFetch({ query: QUERY }, null);

    expect(getServerCookie).not.toHaveBeenCalled();
    expect(enviado().init.headers).not.toHaveProperty("Authorization");
  });

  it("nunca serve do cache do fetch", async () => {
    responde({ data: {} });

    await gqlFetch({ query: QUERY });

    expect(enviado().init.cache).toBe("no-store");
  });

  it("401 e 403 viram UNAUTHORIZED — o chamador derruba a sessão", async () => {
    for (const status of [401, 403]) {
      responde({}, status);
      await expect(gqlFetch({ query: QUERY })).rejects.toThrow("UNAUTHORIZED");
    }
  });

  it("404 tem erro próprio, para a página virar notFound e não erro", async () => {
    responde({}, 404);

    await expect(gqlFetch({ query: QUERY })).rejects.toBeInstanceOf(
      GqlNotFoundError
    );
  });

  it("outros erros de rede levam o status junto", async () => {
    responde({}, 502);

    await expect(gqlFetch({ query: QUERY })).rejects.toThrow(
      "NETWORK_ERROR: 502"
    );
  });

  it("erro do GraphQL (200 com errors) sobe com a mensagem do backend", async () => {
    // É como as exceções humanizadas do backend chegam à tela.
    responde({
      errors: [{ message: "Já existe um cliente com este CNPJ." }],
      data: null,
    });

    await expect(gqlFetch({ query: QUERY })).rejects.toThrow(
      "Já existe um cliente com este CNPJ."
    );
  });

  it("resposta sem data devolve nulo, não undefined", async () => {
    responde({});

    await expect(gqlFetch({ query: QUERY })).resolves.toEqual({ data: null });
  });
});
