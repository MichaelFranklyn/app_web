import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  useInvalidateQueriesClient,
  useRefetchQueriesClient,
} from "./useInvalidateQueries";

const makeClient = () =>
  new ApolloClient({ cache: new InMemoryCache(), link: ApolloLink.empty() });
const wrapperFor =
  (client: ReturnType<typeof makeClient>) =>
  // eslint-disable-next-line react/display-name -- wrapper de teste
  ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );

describe("useInvalidateQueriesClient", () => {
  it("faz evict de cada campo e roda gc", async () => {
    const client = makeClient();
    const evict = vi.spyOn(client.cache, "evict");
    const gc = vi.spyOn(client.cache, "gc");

    const { result } = renderHook(() => useInvalidateQueriesClient(), {
      wrapper: wrapperFor(client),
    });
    await act(async () => {
      await result.current(["orders", "orderStats"]);
    });

    expect(evict).toHaveBeenCalledWith({ fieldName: "orders" });
    expect(evict).toHaveBeenCalledWith({ fieldName: "orderStats" });
    expect(gc).toHaveBeenCalled();
  });

  it("não toca no cache com lista vazia", async () => {
    const client = makeClient();
    const gc = vi.spyOn(client.cache, "gc");

    const { result } = renderHook(() => useInvalidateQueriesClient(), {
      wrapper: wrapperFor(client),
    });
    await act(async () => {
      await result.current([]);
    });

    expect(gc).not.toHaveBeenCalled();
  });
});

describe("useRefetchQueriesClient", () => {
  it("chama refetchQueries com as operações", () => {
    const client = makeClient();
    const refetch = vi
      .spyOn(client, "refetchQueries")
      .mockReturnValue({} as never);

    const { result } = renderHook(() => useRefetchQueriesClient(), {
      wrapper: wrapperFor(client),
    });
    act(() => result.current(["Orders", "OrderStats"]));

    expect(refetch).toHaveBeenCalledWith({ include: ["Orders", "OrderStats"] });
  });

  it("ignora lista vazia", () => {
    const client = makeClient();
    const refetch = vi.spyOn(client, "refetchQueries");

    const { result } = renderHook(() => useRefetchQueriesClient(), {
      wrapper: wrapperFor(client),
    });
    act(() => result.current([]));

    expect(refetch).not.toHaveBeenCalled();
  });
});
