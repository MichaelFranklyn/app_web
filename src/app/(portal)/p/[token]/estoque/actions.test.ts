import { beforeEach, describe, expect, it, vi } from "vitest";

const portalFetchSpy = vi.fn();

vi.mock("@/services/graphql/portalFetch", () => ({
  portalFetch: (...args: unknown[]) => portalFetchSpy(...args),
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

/** A lista que a action releu depois do envio (2ª ida ao backend). */
const freshList = [
  { productId: "p1", productName: "Torneira", daysRemaining: 5 },
  { productId: "p2", productName: "Sifão", daysRemaining: null },
];

beforeEach(() => {
  portalFetchSpy.mockReset();
  // 1ª chamada: a mutation. 2ª: a releitura da lista.
  portalFetchSpy
    .mockResolvedValueOnce({
      submitPortalStock: { status: true, message: "Obrigado!" },
    })
    .mockResolvedValueOnce({ portalStock: { data: freshList } });
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

  it("devolve a lista relida, para a tela mostrar a estimativa nova", async () => {
    const result = await submitPortalStockAction(
      IDLE,
      formWith({ days__p1: "5" }, "tok-abc")
    );

    // Sem isto o cliente veria a estimativa antiga ao lado do "obrigado". A
    // lista vem NA RESPOSTA da action (e não de um `revalidatePath`, que sob
    // concorrência às vezes deixa o envio sem terminar — ver actions.ts).
    expect(portalFetchSpy).toHaveBeenCalledTimes(2);
    expect(portalFetchSpy.mock.calls[1][1]).toBe("tok-abc");
    // Já ordenada por urgência: quem não tem estimativa vai para o fim.
    expect(result.items?.map((i) => i.productId)).toEqual(["p1", "p2"]);
  });

  it("o envio vale mesmo se a releitura da lista falhar", async () => {
    portalFetchSpy.mockReset();
    portalFetchSpy
      .mockResolvedValueOnce({
        submitPortalStock: { status: true, message: "Obrigado!" },
      })
      .mockResolvedValueOnce(null);

    const result = await submitPortalStockAction(
      IDLE,
      formWith({ days__p1: "5" })
    );

    // Confirmação na tela e nenhuma lista nova: a que já estava lá continua.
    expect(result.status).toBe("success");
    expect(result.items).toBeUndefined();
  });

  it("devolve a recusa do backend sem reler a lista", async () => {
    portalFetchSpy.mockReset();
    portalFetchSpy.mockResolvedValue({
      submitPortalStock: { status: false, message: "Não deu." },
    });

    const result = await submitPortalStockAction(
      IDLE,
      formWith({ days__p1: "5" })
    );

    expect(result).toEqual({ status: "error", message: "Não deu." });
    // Só a mutation: recusado, não há lista nova para buscar.
    expect(portalFetchSpy).toHaveBeenCalledTimes(1);
  });

  it("link morto no meio do preenchimento vira recado, não tela quebrada", async () => {
    // portalFetch devolve null quando o backend recusa o token.
    portalFetchSpy.mockReset();
    portalFetchSpy.mockResolvedValue(null);

    const result = await submitPortalStockAction(
      IDLE,
      formWith({ days__p1: "5" })
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("Tente de novo");
  });
});
