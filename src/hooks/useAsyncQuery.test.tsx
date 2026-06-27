import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ComponentProps, ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { useAsyncQuery } from "./useAsyncQuery";

const QUERY = gql`
  query Thing($id: ID!) {
    thing(id: $id) {
      id
      name
    }
  }
`;

interface ThingData {
  thing: { id: string; name: string };
}

const okMock = (id: string, name: string) => ({
  request: { query: QUERY, variables: { id } },
  result: { data: { thing: { id, name } } },
  maxUsageCount: 10,
});

type Mocks = ComponentProps<typeof MockedProvider>["mocks"];

const wrapper =
  (mocks: Mocks) =>
  // eslint-disable-next-line react/display-name -- wrapper de teste
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks}>{children}</MockedProvider>
  );

describe("useAsyncQuery", () => {
  it("não busca por padrão (skip = true)", () => {
    const { result } = renderHook(
      () => useAsyncQuery<ThingData>(QUERY, { variables: { id: "1" } }),
      { wrapper: wrapper([okMock("1", "Ana")]) }
    );
    expect(result.current.data).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });

  it("autoFetch dispara a busca no mount e expõe os dados", async () => {
    const { result } = renderHook(
      () =>
        useAsyncQuery<ThingData>(QUERY, {
          variables: { id: "1" },
          skip: false,
          autoFetch: true,
        }),
      { wrapper: wrapper([okMock("1", "Ana")]) }
    );
    await waitFor(() => expect(result.current.data?.thing.name).toBe("Ana"));
    expect(result.current.loading).toBe(false);
  });

  it("refetch manual marca loading e atualiza os dados", async () => {
    const { result } = renderHook(
      () =>
        useAsyncQuery<ThingData>(QUERY, {
          variables: { id: "1" },
          skip: false,
          cache: false,
        }),
      { wrapper: wrapper([okMock("1", "Ana")]) }
    );
    await waitFor(() => expect(result.current.data?.thing.name).toBe("Ana"));
    await act(async () => {
      await result.current.refetch({ id: "1" });
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.data?.thing.name).toBe("Ana");
  });

  it("mapeia o erro do Apollo para um Error simples", async () => {
    const errMock = {
      request: { query: QUERY, variables: { id: "x" } },
      error: new Error("falhou"),
    };
    const { result } = renderHook(
      () =>
        useAsyncQuery<ThingData>(QUERY, {
          variables: { id: "x" },
          skip: false,
        }),
      { wrapper: wrapper([errMock]) }
    );
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.error?.message).toBe("falhou");
  });
});
