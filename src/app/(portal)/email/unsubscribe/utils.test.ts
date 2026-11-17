import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./one-click/route";
import {
  UNSUBSCRIBE_CLIENT_ORDER_EMAILS,
  UNSUBSCRIBE_EMAIL_DIGEST,
} from "./gql";
import { parseUnsubscribeKind, requestUnsubscribe } from "./utils";

const tokenFetch = vi.hoisted(() => vi.fn());
vi.mock("@/services/graphql/tokenFetch", () => ({ tokenFetch }));

beforeEach(() => {
  tokenFetch.mockReset();
});

describe("parseUnsubscribeKind", () => {
  it("só `client` é o contato; o resto é o resumo do usuário", () => {
    expect(parseUnsubscribeKind("client")).toBe("client");
    expect(parseUnsubscribeKind(undefined)).toBe("digest");
    expect(parseUnsubscribeKind("qualquer")).toBe("digest");
  });
});

describe("requestUnsubscribe", () => {
  it("o contato do cliente chama a mutation dos avisos de pedido", async () => {
    tokenFetch.mockResolvedValue({
      unsubscribeClientOrderEmails: { status: true, message: "Pronto." },
    });

    const result = await requestUnsubscribe("client", "tk");

    expect(tokenFetch).toHaveBeenCalledWith(
      UNSUBSCRIBE_CLIENT_ORDER_EMAILS,
      null,
      {
        token: "tk",
      }
    );
    expect(result).toEqual({ status: true, message: "Pronto." });
  });

  it("o usuário segue na mutation dos resumos", async () => {
    tokenFetch.mockResolvedValue(null);

    expect(await requestUnsubscribe("digest", "tk")).toBeNull();
    expect(tokenFetch).toHaveBeenCalledWith(UNSUBSCRIBE_EMAIL_DIGEST, null, {
      token: "tk",
    });
  });
});

describe("one-click", () => {
  const url =
    "https://app.itinus.com.br/email/unsubscribe/one-click?kind=client&token=tk";

  it("POST descadastra pelo kind do link e responde 200 mesmo com falha", async () => {
    tokenFetch.mockImplementation(async () => {
      throw new Error("fora");
    });

    const response = await POST(new NextRequest(url, { method: "POST" }));

    expect(response.status).toBe(200);
    expect(tokenFetch.mock.calls[0][0]).toBe(UNSUBSCRIBE_CLIENT_ORDER_EMAILS);
  });

  it("GET leva à página com o botão, sem descadastrar, mantendo o kind", () => {
    const response = GET(new NextRequest(url));
    const target = new URL(response.headers.get("location") ?? "");

    expect(tokenFetch).not.toHaveBeenCalled();
    expect(target.pathname).toBe("/email/unsubscribe");
    expect(target.searchParams.get("kind")).toBe("client");
    expect(target.searchParams.get("token")).toBe("tk");
  });
});
