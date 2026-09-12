import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, POST } from "./route";

const { gqlFetch, getServerCookie, setServerCookie, removeServerCookie } =
  vi.hoisted(() => ({
    gqlFetch: vi.fn(),
    getServerCookie: vi.fn(),
    setServerCookie: vi.fn(),
    removeServerCookie: vi.fn(),
  }));

vi.mock("@/services/graphql/gqlFetch", () => ({ gqlFetch }));
vi.mock("@/utils/cookies/serverCookie", () => ({
  getServerCookie,
  setServerCookie,
  removeServerCookie,
}));

/**
 * A rota é o BFF da sessão: a mutation roda no SERVIDOR e o token vai para um
 * cookie httpOnly, invisível ao JS do navegador. É esse contrato que os casos
 * abaixo prendem — sobretudo que o token NUNCA saia na resposta.
 */
const req = (body: unknown) =>
  ({ json: async () => body }) as Parameters<typeof POST>[0];

const authData = (over: Record<string, unknown> = {}) => ({
  accessToken: "token-de-acesso",
  refreshToken: "token-de-refresh",
  userId: "u-1",
  userName: "Ana",
  companyName: "Empresa Teste",
  role: "OWNER",
  sellerId: null,
  ...over,
});

const respondeLogin = (payload: unknown) =>
  gqlFetch.mockResolvedValue({ data: { login: payload } });

const cookie = (name: string) =>
  setServerCookie.mock.calls.find((call) => call[0] === name);

beforeEach(() => {
  gqlFetch.mockReset();
  getServerCookie.mockReset();
  setServerCookie.mockReset();
  removeServerCookie.mockReset();
});

describe("POST — login", () => {
  it("guarda o token em cookie httpOnly e não o devolve ao navegador", async () => {
    respondeLogin({ status: true, message: "ok", data: authData() });

    const res = await POST(req({ action: "login", input: { email: "a@b.c" } }));
    const json = await res.json();

    expect(json.status).toBe(true);
    expect(JSON.stringify(json)).not.toContain("token-de-acesso");
    expect(cookie("token")?.[1]).toBe("token-de-acesso");
    expect(cookie("token")?.[2]).toEqual(
      expect.objectContaining({ httpOnly: true })
    );
  });

  it("o userData é legível pelo JS: não é segredo, é o que a UI mostra", async () => {
    respondeLogin({ status: true, data: authData({ sellerId: "s-9" }) });

    await POST(req({ action: "login", input: {} }));

    expect(cookie("userData")?.[1]).toEqual({
      userId: "u-1",
      userName: "Ana",
      companyName: "Empresa Teste",
      role: "OWNER",
      sellerId: "s-9",
    });
    expect(cookie("userData")?.[2]).not.toEqual(
      expect.objectContaining({ httpOnly: true })
    );
  });

  it("lembrar da sessão estica os cookies para 30 dias", async () => {
    respondeLogin({ status: true, data: authData() });

    await POST(req({ action: "login", input: {}, remember: true }));

    expect(cookie("token")?.[2]).toEqual(
      expect.objectContaining({ expires: 30 })
    );
    expect(cookie("remember")?.[1]).toBe("true");
  });

  it("sem lembrar, não fixa prazo (vale o padrão do cookie)", async () => {
    respondeLogin({ status: true, data: authData() });

    await POST(req({ action: "login", input: {} }));

    expect(cookie("token")?.[2]).not.toHaveProperty("expires");
    expect(cookie("remember")?.[1]).toBe("false");
  });

  it("a mutation roda com token nulo: login é público", async () => {
    respondeLogin({ status: true, data: authData() });

    await POST(req({ action: "login", input: { email: "a@b.c" } }));

    expect(gqlFetch).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { input: { email: "a@b.c" } } }),
      null
    );
  });

  it("credencial recusada devolve 401 com a mensagem do backend", async () => {
    respondeLogin({
      status: false,
      message: "Credenciais inválidas.",
      data: null,
    });

    const res = await POST(req({ action: "login", input: {} }));

    expect(res.status).toBe(401);
    expect((await res.json()).message).toBe("Credenciais inválidas.");
    expect(setServerCookie).not.toHaveBeenCalled();
  });

  it("backend fora do ar vira 401 com a mensagem do erro", async () => {
    gqlFetch.mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await POST(req({ action: "login", input: {} }));

    expect(res.status).toBe(401);
    expect((await res.json()).message).toBe("ECONNREFUSED");
  });

  it("ação desconhecida é 400, e não uma sessão aberta por engano", async () => {
    const res = await POST(req({ action: "quemSabe", input: {} }));

    expect(res.status).toBe(400);
    expect(gqlFetch).not.toHaveBeenCalled();
    expect(setServerCookie).not.toHaveBeenCalled();
  });

  it("sem ação nenhuma também é 400", async () => {
    const res = await POST(req({}));

    expect(res.status).toBe(400);
  });
});

describe("POST — outras ações de autenticação", () => {
  it("signup abre a sessão, mas não grava a marca de lembrar", async () => {
    // `remember` é do login: o cadastro não tem essa caixa na tela.
    gqlFetch.mockResolvedValue({
      data: { registerCompany: { status: true, data: authData() } },
    });

    await POST(req({ action: "signup", input: { cnpj: "1" }, remember: true }));

    expect(cookie("token")).toBeDefined();
    expect(cookie("remember")).toBeUndefined();
  });

  it("redefinir senha já deixa a pessoa logada", async () => {
    gqlFetch.mockResolvedValue({
      data: { resetPassword: { status: true, data: authData() } },
    });

    const res = await POST(
      req({ action: "changePassword", input: { token: "t", password: "x" } })
    );

    expect(res.status).toBe(200);
    expect(cookie("token")?.[1]).toBe("token-de-acesso");
  });
});

describe("POST — entrar como (suporte)", () => {
  const comSessaoDoSu = () =>
    getServerCookie.mockImplementation(async (name: string) =>
      name === "token"
        ? "token-do-su"
        : name === "userData"
          ? { userId: "su-1", userName: "Suporte Girus" }
          : null
    );

  it("guarda a sessão do SU e assume a do usuário", async () => {
    comSessaoDoSu();
    gqlFetch.mockResolvedValue({
      data: {
        impersonateUser: {
          status: true,
          data: authData({ userName: "Cliente", role: "SELLER" }),
        },
      },
    });

    const res = await POST(
      req({ action: "impersonate", input: { userId: "u-1" } })
    );

    expect(res.status).toBe(200);
    // A credencial do SU sai do alcance do JS da sessão emprestada.
    expect(cookie("suToken")?.[1]).toBe("token-do-su");
    expect(cookie("suToken")?.[2]).toEqual(
      expect.objectContaining({ httpOnly: true })
    );
    expect(cookie("token")?.[1]).toBe("token-de-acesso");
  });

  it("marca quem está por trás, para a faixa de aviso dizer o nome", async () => {
    comSessaoDoSu();
    gqlFetch.mockResolvedValue({
      data: { impersonateUser: { status: true, data: authData() } },
    });

    await POST(req({ action: "impersonate", input: { userId: "u-1" } }));

    expect(cookie("userData")?.[1]).toEqual(
      expect.objectContaining({ impersonatedBy: "Suporte Girus" })
    );
  });

  it("roda a mutation COM o token do SU: ela é @is_super_user", async () => {
    comSessaoDoSu();
    gqlFetch.mockResolvedValue({
      data: { impersonateUser: { status: true, data: authData() } },
    });

    await POST(
      req({
        action: "impersonate",
        input: { userId: "u-1", reason: "chamado 42" },
      })
    );

    expect(gqlFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { userId: "u-1", reason: "chamado 42" },
      }),
      "token-do-su"
    );
  });

  it("sem sessão de SU, recusa antes de ir ao backend", async () => {
    getServerCookie.mockResolvedValue(null);

    const res = await POST(
      req({ action: "impersonate", input: { userId: "u-1" } })
    );

    expect(res.status).toBe(401);
    expect(gqlFetch).not.toHaveBeenCalled();
  });

  it("backend recusando a personificação não troca cookie nenhum", async () => {
    comSessaoDoSu();
    gqlFetch.mockResolvedValue({
      data: {
        impersonateUser: {
          status: false,
          message: "Usuário inativo.",
          data: null,
        },
      },
    });

    const res = await POST(
      req({ action: "impersonate", input: { userId: "u-1" } })
    );

    expect(res.status).toBe(400);
    expect((await res.json()).message).toBe("Usuário inativo.");
    expect(setServerCookie).not.toHaveBeenCalled();
  });

  it("erro de rede na personificação vira 400, não 500", async () => {
    comSessaoDoSu();
    gqlFetch.mockRejectedValue(new Error("timeout"));

    const res = await POST(
      req({ action: "impersonate", input: { userId: "u-1" } })
    );

    expect(res.status).toBe(400);
    expect((await res.json()).message).toBe("timeout");
  });
});

describe("POST — voltar a ser o SU", () => {
  it("devolve a sessão guardada e descarta a emprestada", async () => {
    getServerCookie.mockImplementation(async (name: string) =>
      name === "suToken"
        ? "token-do-su"
        : name === "suUserData"
          ? { userId: "su-1", userName: "Suporte Girus" }
          : null
    );

    const res = await POST(req({ action: "stopImpersonation" }));

    expect(res.status).toBe(200);
    expect(cookie("token")?.[1]).toBe("token-do-su");
    expect(cookie("userData")?.[1]).toEqual(
      expect.objectContaining({ userName: "Suporte Girus" })
    );
    expect(removeServerCookie).toHaveBeenCalledWith("suToken");
    expect(removeServerCookie).toHaveBeenCalledWith("suUserData");
  });

  it("sem a sessão guardada, derruba tudo em vez de prender na conta emprestada", async () => {
    getServerCookie.mockResolvedValue(null);

    const res = await POST(req({ action: "stopImpersonation" }));

    expect(res.status).toBe(401);
    expect(removeServerCookie).toHaveBeenCalledWith("token");
    expect(removeServerCookie).toHaveBeenCalledWith("userData");
  });
});

describe("DELETE — sair", () => {
  it("limpa a sessão inteira, inclusive a do console", async () => {
    // Deixar a sessão do SU para trás permitiria voltar ao console depois de um
    // logout explícito.
    const res = await DELETE();

    expect(res.status).toBe(200);
    const limpos = removeServerCookie.mock.calls.map((c) => c[0]);
    expect(limpos).toEqual([
      "token",
      "userData",
      "remember",
      "code",
      "suToken",
      "suUserData",
    ]);
  });
});
