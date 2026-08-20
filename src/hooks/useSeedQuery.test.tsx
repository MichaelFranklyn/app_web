import { ApolloClient, ApolloLink, InMemoryCache, gql } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useSeedQuery } from "./useSeedQuery";

// `order(id: $id)` e não `order`: é o argumento que separa as entradas do cache
// (`order({"id":"o1"})`). Sem ele todos os pedidos cairiam na MESMA entrada, e o
// teste de troca de registro passaria por acidente.
const ORDER_QUERY = gql`
  query Order($id: ID!) {
    order(id: $id) {
      status
      data {
        id
        code
      }
    }
  }
`;

const ITEMS_QUERY = gql`
  query Items($orderId: ID!) {
    items(orderId: $orderId) {
      totalCount
    }
  }
`;

const orderData = (code: string) => ({
  order: {
    __typename: "OrderResponse",
    status: true,
    data: { __typename: "Order", id: "o1", code },
  },
});

const renderSeed = (
  client: ApolloClient,
  entries: Parameters<typeof useSeedQuery>[0],
  seedKey?: string
) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  return renderHook(
    ({ e, k }: { e: typeof entries; k?: string }) => useSeedQuery(e, k),
    { wrapper, initialProps: { e: entries, k: seedKey } }
  );
};

// Link vazio de propósito: o hook só escreve no cache — nada aqui deve ir à rede.
const makeClient = () =>
  new ApolloClient({ cache: new InMemoryCache(), link: ApolloLink.empty() });

describe("useSeedQuery", () => {
  it("deixa a query legível no cache já no primeiro render", () => {
    const client = makeClient();

    renderSeed(client, [
      { query: ORDER_QUERY, variables: { id: "o1" }, data: orderData("A1") },
    ]);

    const cached = client.readQuery({
      query: ORDER_QUERY,
      variables: { id: "o1" },
    });
    expect(cached).toMatchObject({ order: { data: { code: "A1" } } });
  });

  it("semeia várias queries de uma vez", () => {
    const client = makeClient();

    renderSeed(client, [
      { query: ORDER_QUERY, variables: { id: "o1" }, data: orderData("A1") },
      {
        query: ITEMS_QUERY,
        variables: { orderId: "o1" },
        data: { items: { __typename: "ItemsConnection", totalCount: 3 } },
      },
    ]);

    expect(
      client.readQuery({ query: ITEMS_QUERY, variables: { orderId: "o1" } })
    ).toMatchObject({ items: { totalCount: 3 } });
  });

  // O caso que justifica ignorar entrada nula: semear vazio faria o cache-first
  // acertar um "hit" sem dados e a tela ficaria parada sem nunca buscar.
  it("ignora entrada nula e deixa o cache intacto", () => {
    const client = makeClient();

    renderSeed(client, [
      { query: ORDER_QUERY, variables: { id: "o1" }, data: null },
    ]);

    expect(
      client.readQuery({ query: ORDER_QUERY, variables: { id: "o1" } })
    ).toBeNull();
  });

  it("engole shape divergente sem derrubar o render", () => {
    const client = makeClient();

    expect(() =>
      renderSeed(client, [
        { query: ORDER_QUERY, variables: { id: "o1" }, data: { lixo: 1 } },
      ])
    ).not.toThrow();
  });

  it("semeia de novo quando a página troca de registro", () => {
    const client = makeClient();

    const { rerender } = renderSeed(
      client,
      [{ query: ORDER_QUERY, variables: { id: "o1" }, data: orderData("A1") }],
      "o1"
    );

    // Mesma rota, outro pedido: o React reaproveita a instância do componente,
    // então sem a chave o segundo nunca seria semeado.
    rerender({
      e: [
        {
          query: ORDER_QUERY,
          variables: { id: "o2" },
          data: {
            order: {
              __typename: "OrderResponse",
              status: true,
              data: { __typename: "Order", id: "o2", code: "B2" },
            },
          },
        },
      ],
      k: "o2",
    });

    expect(
      client.readQuery({ query: ORDER_QUERY, variables: { id: "o2" } })
    ).toMatchObject({ order: { data: { code: "B2" } } });
  });

  // A guarda que faltava. O `data` vem do payload RSC, que numa volta de
  // navegação pode ser anterior à mutation que já atualizou o cache: escrever
  // por cima devolvia o dado velho à tela até o próximo reload.
  it("não sobrescreve o que já está no cache", () => {
    const client = makeClient();

    // Estado "pós-mutation": o cliente já tem a versão nova.
    client.writeQuery({
      query: ORDER_QUERY,
      variables: { id: "o1" },
      data: orderData("NOVO"),
    });

    renderSeed(client, [
      { query: ORDER_QUERY, variables: { id: "o1" }, data: orderData("VELHO") },
    ]);

    expect(
      client.readQuery({ query: ORDER_QUERY, variables: { id: "o1" } })
    ).toMatchObject({ order: { data: { code: "NOVO" } } });
  });

  it("não repete a escrita enquanto a chave não muda", () => {
    const client = makeClient();
    const writes: unknown[] = [];
    const original = client.writeQuery.bind(client);
    client.writeQuery = ((options: Parameters<typeof original>[0]) => {
      writes.push(options);
      return original(options);
    }) as typeof client.writeQuery;

    const { rerender } = renderSeed(
      client,
      [{ query: ORDER_QUERY, variables: { id: "o1" }, data: orderData("A1") }],
      "o1"
    );
    rerender({
      e: [
        { query: ORDER_QUERY, variables: { id: "o1" }, data: orderData("A1") },
      ],
      k: "o1",
    });

    expect(writes).toHaveLength(1);
  });
});
