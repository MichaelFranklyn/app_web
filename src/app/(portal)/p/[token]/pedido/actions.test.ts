import { beforeEach, describe, expect, it, vi } from "vitest";

const portalFetchSpy = vi.fn();

vi.mock("@/services/graphql/portalFetch", () => ({
  portalFetch: (...args: unknown[]) => portalFetchSpy(...args),
}));

const { requestOrderAction } = await import("./actions");
const { REQUEST_PORTAL_QUOTE } = await import("../gql");

const IDLE = { status: "idle" as const, message: "" };

const formWith = (entries: Record<string, string>, token = "tok-1") => {
  const form = new FormData();
  form.set("token", token);
  Object.entries(entries).forEach(([key, value]) => form.set(key, value));
  return form;
};

const sent = (orderIds: string[]) => ({
  requestPortalQuote: {
    status: true,
    message: "Pedido enviado",
    data: { orderIds },
  },
});

beforeEach(() => {
  portalFetchSpy.mockReset();
  portalFetchSpy.mockImplementation(async (query: unknown) =>
    query === REQUEST_PORTAL_QUOTE ? sent(["ord-1"]) : null
  );
});

describe("requestOrderAction", () => {
  it("envia a lista com recado (sem desconto) e aponta o pedido enviado", async () => {
    const result = await requestOrderAction(
      IDLE,
      formWith({
        pick__p1: "on",
        qty__p1: "24",
        pick__p2: "on",
        qty__p2: "6",
        discountPercent: "5",
        note: "até sexta",
        q: "torn",
        p: "2",
        f: "fab-1",
      })
    );

    expect(portalFetchSpy).toHaveBeenCalledWith(REQUEST_PORTAL_QUOTE, "tok-1", {
      input: {
        items: [
          { productId: "p1", quantity: "24" },
          { productId: "p2", quantity: "6" },
        ],
        note: "até sexta",
      },
    });
    // A tela sai daqui: nada de reler as listas que o cliente vai deixar.
    expect(portalFetchSpy).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("success");
    expect(result.message).toBe("Pedido enviado");
    expect(result.redirectTo).toBe("/p/tok-1/enviados/ord-1?enviado=1");
    expect(result.submission).toBeTypeOf("number");
  });

  it("mais de um pedido (ou nenhum id) leva à lista dos enviados", async () => {
    portalFetchSpy.mockResolvedValueOnce(sent(["ord-1", "ord-2"]));
    const many = await requestOrderAction(
      IDLE,
      formWith({ pick__p1: "on", qty__p1: "3" })
    );
    expect(many.redirectTo).toBe("/p/tok-1/enviados?enviado=1");

    portalFetchSpy.mockResolvedValueOnce({
      requestPortalQuote: { status: true, message: "ok", data: null },
    });
    const none = await requestOrderAction(
      IDLE,
      formWith({ pick__p1: "on", qty__p1: "3" })
    );
    expect(none.redirectTo).toBe("/p/tok-1/enviados?enviado=1");
  });

  it("quantidade zerada não chega ao servidor", async () => {
    const result = await requestOrderAction(
      IDLE,
      formWith({ pick__p1: "on", qty__p1: "0" })
    );
    expect(result.status).toBe("error");
    expect(portalFetchSpy).not.toHaveBeenCalled();
  });

  it("sem token pede para abrir o link de novo", async () => {
    const result = await requestOrderAction(IDLE, formWith({}, ""));
    expect(result.message).toMatch(/Abra o link de novo/);
    expect(portalFetchSpy).not.toHaveBeenCalled();
  });

  it("recusa do servidor vira erro com a mensagem dele, sem destino", async () => {
    portalFetchSpy.mockReset();
    portalFetchSpy.mockResolvedValueOnce({
      requestPortalQuote: {
        status: false,
        message: "Pedido pelo portal indisponível.",
      },
    });
    const result = await requestOrderAction(
      IDLE,
      formWith({ pick__p1: "on", qty__p1: "3" })
    );
    expect(result).toEqual({
      status: "error",
      message: "Pedido pelo portal indisponível.",
    });
    expect(portalFetchSpy).toHaveBeenCalledTimes(1);
  });
});
