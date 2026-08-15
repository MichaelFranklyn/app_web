import { beforeEach, describe, expect, it, vi } from "vitest";

const portalFetchSpy = vi.fn();
const revalidateSpy = vi.fn();

vi.mock("@/services/graphql/portalFetch", () => ({
  portalFetch: (...args: unknown[]) => portalFetchSpy(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidateSpy(...args),
}));

const { submitPortalStockAction } = await import("./actions");

const IDLE = { status: "idle" as const, message: "" };

const formWith = (
  entries: Record<string, string>,
  token = "tok-123"
): FormData => {
  const form = new FormData();
  form.set("token", token);
  Object.entries(entries).forEach(([key, value]) => form.set(key, value));
  return form;
};

/** Os itens que a action decidiu mandar para o backend. */
const sentItems = () =>
  portalFetchSpy.mock.calls[0][2].input.items as Array<{
    productId: string;
    daysRemaining: number;
  }>;

beforeEach(() => {
  portalFetchSpy.mockReset();
  revalidateSpy.mockReset();
  portalFetchSpy.mockResolvedValue({
    submitPortalStock: { status: true, message: "Obrigado!" },
  });
});

describe("submitPortalStockAction", () => {
  it("manda só os produtos preenchidos", async () => {
    const result = await submitPortalStockAction(
      IDLE,
      formWith({ days__p1: "10", days__p2: "", days__p3: "3" })
    );

    // O campo em branco é a linha que o cliente pulou: ela não pode virar dado.
    expect(sentItems()).toEqual([
      { productId: "p1", daysRemaining: 10 },
      { productId: "p3", daysRemaining: 3 },
    ]);
    expect(result.status).toBe("success");
  });

  it("aceita zero — é o cliente dizendo que acabou", async () => {
    await submitPortalStockAction(IDLE, formWith({ days__p1: "0" }));

    expect(sentItems()).toEqual([{ productId: "p1", daysRemaining: 0 }]);
  });

  it("ignora número negativo e texto", async () => {
    await submitPortalStockAction(
      IDLE,
      formWith({ days__p1: "-4", days__p2: "muitos", days__p3: "5" })
    );

    expect(sentItems()).toEqual([{ productId: "p3", daysRemaining: 5 }]);
  });

  it("trunca o decimal", async () => {
    await submitPortalStockAction(IDLE, formWith({ days__p1: "7.9" }));

    expect(sentItems()).toEqual([{ productId: "p1", daysRemaining: 7 }]);
  });

  it("ignora campos que não são de dias", async () => {
    await submitPortalStockAction(
      IDLE,
      formWith({ days__p1: "5", outroCampo: "99" })
    );

    expect(sentItems()).toEqual([{ productId: "p1", daysRemaining: 5 }]);
  });

  it("não chama o backend quando nada foi preenchido", async () => {
    const result = await submitPortalStockAction(
      IDLE,
      formWith({ days__p1: "", days__p2: "" })
    );

    expect(portalFetchSpy).not.toHaveBeenCalled();
    expect(result.status).toBe("error");
    expect(result.message).toContain("Preencha");
  });

  it("recusa sem token em vez de chamar o backend sem credencial", async () => {
    const form = new FormData();
    form.set("days__p1", "5");

    const result = await submitPortalStockAction(IDLE, form);

    expect(portalFetchSpy).not.toHaveBeenCalled();
    expect(result.status).toBe("error");
  });

  it("manda o token recebido no formulário", async () => {
    await submitPortalStockAction(IDLE, formWith({ days__p1: "5" }, "tok-abc"));

    expect(portalFetchSpy.mock.calls[0][1]).toBe("tok-abc");
  });

  it("revalida a própria tela no sucesso", async () => {
    await submitPortalStockAction(IDLE, formWith({ days__p1: "5" }, "tok-abc"));

    // Sem isto o cliente veria a estimativa antiga ao lado do "obrigado".
    expect(revalidateSpy).toHaveBeenCalledWith("/p/tok-abc/estoque");
  });

  it("devolve a recusa do backend sem revalidar", async () => {
    portalFetchSpy.mockResolvedValue({
      submitPortalStock: { status: false, message: "Não deu." },
    });

    const result = await submitPortalStockAction(
      IDLE,
      formWith({ days__p1: "5" })
    );

    expect(result).toEqual({ status: "error", message: "Não deu." });
    expect(revalidateSpy).not.toHaveBeenCalled();
  });

  it("link morto no meio do preenchimento vira recado, não tela quebrada", async () => {
    // portalFetch devolve null quando o backend recusa o token.
    portalFetchSpy.mockResolvedValue(null);

    const result = await submitPortalStockAction(
      IDLE,
      formWith({ days__p1: "5" })
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("Tente de novo");
  });
});
