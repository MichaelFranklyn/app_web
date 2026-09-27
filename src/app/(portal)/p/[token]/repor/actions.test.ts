import { beforeEach, describe, expect, it, vi } from "vitest";

const portalFetchSpy = vi.fn();

vi.mock("@/services/graphql/portalFetch", () => ({
  portalFetch: (...args: unknown[]) => portalFetchSpy(...args),
}));

const { requestReplenishmentAction } = await import("./actions");
const { formatUnits, pickedEntries } = await import("./utils");

const IDLE = { status: "idle" as const, message: "" };

const formWith = (entries: Record<string, string>, token = "tok-1") => {
  const form = new FormData();
  form.set("token", token);
  Object.entries(entries).forEach(([key, value]) => form.set(key, value));
  return form;
};

const freshItems = [
  {
    productId: "p1",
    productName: "Torneira",
    pendingQuantity: "12.0000",
  },
];

beforeEach(() => {
  portalFetchSpy.mockReset();
  portalFetchSpy
    .mockResolvedValueOnce({
      requestPortalReplenishment: { status: true, message: "Pedido enviado" },
    })
    .mockResolvedValueOnce({
      portalReplenishment: { data: { horizonDays: 15, items: freshItems } },
    });
});

describe("pickedEntries", () => {
  it("só as linhas MARCADAS vão — a quantidade preenchida sozinha não pede", () => {
    const entries = pickedEntries(
      formWith({
        pick__p1: "on",
        qty__p1: "12",
        qty__p2: "24", // não marcado
        pick__p3: "on",
        qty__p3: "0", // marcado e zerado: não é pedido
        pick__p4: "on",
        qty__p4: "1,5", // vírgula do teclado brasileiro
      })
    );
    expect(entries).toEqual([
      { productId: "p1", quantity: "12" },
      { productId: "p4", quantity: "1.5" },
    ]);
  });
});

describe("formatUnits", () => {
  it("tira as casas do Decimal", () => {
    expect(formatUnits("12.0000")).toBe("12");
    expect(formatUnits(null)).toBe("");
  });
});

describe("requestReplenishmentAction", () => {
  it("envia o que foi marcado e devolve a lista relida", async () => {
    const result = await requestReplenishmentAction(
      IDLE,
      formWith({ pick__p1: "on", qty__p1: "12" })
    );

    expect(portalFetchSpy.mock.calls[0][2]).toEqual({
      input: { items: [{ productId: "p1", quantity: "12" }] },
    });
    expect(result.status).toBe("success");
    expect(result.items).toEqual(freshItems);
    // Muda a cada envio: é o que desmarca a grade.
    expect(result.submission).toEqual(expect.any(Number));
  });

  it("nada marcado não chega ao backend", async () => {
    const result = await requestReplenishmentAction(
      IDLE,
      formWith({ qty__p1: "12" })
    );
    expect(result.status).toBe("error");
    expect(portalFetchSpy).not.toHaveBeenCalled();
  });

  it("recusa do backend chega com a mensagem dele", async () => {
    portalFetchSpy.mockReset();
    portalFetchSpy.mockResolvedValueOnce({
      requestPortalReplenishment: {
        status: false,
        message: "Pedido pelo portal indisponível.",
      },
    });
    const result = await requestReplenishmentAction(
      IDLE,
      formWith({ pick__p1: "on", qty__p1: "12" })
    );
    expect(result).toMatchObject({
      status: "error",
      message: "Pedido pelo portal indisponível.",
    });
  });

  it("sem token não envia", async () => {
    const result = await requestReplenishmentAction(
      IDLE,
      formWith({ pick__p1: "on", qty__p1: "12" }, "")
    );
    expect(result.status).toBe("error");
    expect(portalFetchSpy).not.toHaveBeenCalled();
  });
});
