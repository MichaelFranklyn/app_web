import { gql } from "@apollo/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { logout } = vi.hoisted(() => ({ logout: vi.fn(async () => {}) }));
vi.mock("@/utils/auth/logout", () => ({ logout }));

const QUERY = gql`
  query Ping {
    ping
  }
`;

const respondWith = (status: number) =>
  vi.fn(
    async () =>
      new Response(
        JSON.stringify(
          status === 200
            ? { data: { ping: true } }
            : { errors: [{ message: "x", extensions: { code: status } }] }
        ),
        { status, headers: { "Content-Type": "application/json" } }
      )
  );

/** Módulo novo a cada teste: a trava de "já saindo" é de módulo. */
const freshClient = async () => {
  vi.resetModules();
  const { createApolloClient } = await import("./client");
  return createApolloClient();
};

describe("cliente Apollo", () => {
  beforeEach(() => {
    logout.mockClear();
    window.history.replaceState(null, "", "/dashboard");
  });
  afterEach(() => vi.unstubAllGlobals());

  it("401 do BFF (sessão recusada) leva ao login, uma vez só", async () => {
    vi.stubGlobal("fetch", respondWith(401));
    const client = await freshClient();

    await Promise.allSettled([
      client.query({ query: QUERY, fetchPolicy: "no-cache" }),
      client.query({ query: QUERY, fetchPolicy: "no-cache" }),
    ]);

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("no próprio /login o 401 não recarrega a página (seria um laço)", async () => {
    window.history.replaceState(null, "", "/login");
    vi.stubGlobal("fetch", respondWith(401));
    const client = await freshClient();

    await client
      .query({ query: QUERY, fetchPolicy: "no-cache" })
      .catch(() => {});

    expect(logout).not.toHaveBeenCalled();
  });

  it("outras recusas (403) não derrubam a sessão", async () => {
    vi.stubGlobal("fetch", respondWith(403));
    const client = await freshClient();

    await client
      .query({ query: QUERY, fetchPolicy: "no-cache" })
      .catch(() => {});

    expect(logout).not.toHaveBeenCalled();
  });
});
