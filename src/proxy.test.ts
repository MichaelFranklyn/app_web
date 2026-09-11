import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config, proxy } from "./proxy";

const { getServerCookie } = vi.hoisted(() => ({ getServerCookie: vi.fn() }));
vi.mock("./utils/cookies/serverCookie", () => ({ getServerCookie }));

const BASE = "https://app.girus.test";

/** JWT de 3 segmentos com o `exp` pedido — a assinatura não é verificada aqui. */
const jwt = (exp?: number): string => {
  const payload = Buffer.from(JSON.stringify(exp ? { exp } : {})).toString(
    "base64url"
  );
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.assinatura`;
};

const daquiAUmaHora = Math.floor(Date.now() / 1000) + 3600;
const ontem = Math.floor(Date.now() / 1000) - 86_400;

/** Sessão nos cookies. `null` em qualquer um deles = sessão inválida. */
const sessao = (
  token: string | null,
  userData: Record<string, unknown> | null
) =>
  getServerCookie.mockImplementation(async (name: string) =>
    name === "token" ? token : name === "userData" ? userData : null
  );

const semSessao = () => sessao(null, null);
const comSessao = (role = "OWNER", exp = daquiAUmaHora) =>
  sessao(jwt(exp), { userId: "u-1", role });

const pedir = (pathname: string, cookies: Record<string, string> = {}) => {
  const request = new NextRequest(new URL(pathname, BASE));
  for (const [name, value] of Object.entries(cookies)) {
    request.cookies.set(name, value);
  }
  return proxy(request);
};

/** Para onde o proxy mandou, ou `null` quando deixou passar. */
const destino = (response: Response): string | null => {
  const location = response.headers.get("location");
  return location
    ? new URL(location).pathname + new URL(location).search
    : null;
};

beforeEach(() => getServerCookie.mockReset());

describe("rotas públicas de marketing", () => {
  it.each(["/", "/precos", "/termos", "/privacidade", "/assinar"])(
    "%s abre para qualquer um, antes de ler cookie nenhum",
    async (rota) => {
      const response = await pedir(rota);

      expect(destino(response)).toBeNull();
      // A landing é a mesma para visitante, cliente logado e gente da
      // plataforma — nem chega a perguntar quem é.
      expect(getServerCookie).not.toHaveBeenCalled();
    }
  );

  it("a liberação da raiz é EXATA: não abre o sistema inteiro", async () => {
    // Um `startsWith("/")` para a raiz casaria com toda tela privada.
    semSessao();

    expect(destino(await pedir("/dashboard"))).toBe("/login?href=%2Fdashboard");
  });
});

describe("portal do cliente", () => {
  it("abre por PREFIXO: o token faz parte do caminho", async () => {
    const response = await pedir("/p/token-do-cliente/pedidos/order-1");

    expect(destino(response)).toBeNull();
    expect(getServerCookie).not.toHaveBeenCalled();
  });

  it("a raiz do portal também passa", async () => {
    expect(destino(await pedir("/p"))).toBeNull();
  });

  it("o prefixo não vaza para uma rota que só começa igual", async () => {
    semSessao();

    // `/pedidos` não é `/p/...`: continua protegida.
    expect(destino(await pedir("/pedidos"))).toBe("/login?href=%2Fpedidos");
  });
});

describe("sessão inválida", () => {
  it("sem token, manda para o login guardando para onde a pessoa ia", async () => {
    semSessao();

    expect(destino(await pedir("/orders/order-1"))).toBe(
      "/login?href=%2Forders%2Forder-1"
    );
  });

  it("token de pé mas sem userData também é sessão inválida", async () => {
    sessao(jwt(daquiAUmaHora), null);

    expect(destino(await pedir("/clients"))).toBe("/login?href=%2Fclients");
  });

  it("token expirado não chega a bater no backend", async () => {
    // Checar o `exp` aqui evita um SSR inteiro com credencial morta.
    comSessao("OWNER", ontem);

    expect(destino(await pedir("/clients"))).toBe("/login?href=%2Fclients");
  });

  it("token sem `exp` não é bloqueado: quem decide é o backend", async () => {
    sessao(jwt(), { userId: "u-1", role: "OWNER" });

    expect(destino(await pedir("/clients"))).toBeNull();
  });

  it("limpa os cookies ao expulsar, para a sessão morta não voltar", async () => {
    semSessao();

    const request = new NextRequest(new URL("/clients", BASE));
    request.cookies.set("token", "velho");
    request.cookies.set("userData", "velho");
    const response = await proxy(request);

    const apagados = response.cookies
      .getAll()
      .filter((cookie) => cookie.value === "");
    expect(apagados.map((c) => c.name)).toEqual(
      expect.arrayContaining(["token", "userData"])
    );
  });

  it("as telas de autenticação continuam abertas sem sessão", async () => {
    semSessao();

    for (const rota of [
      "/login",
      "/signup",
      "/forgot-password",
      "/change-password",
      "/offline",
    ]) {
      expect(destino(await pedir(rota)), rota).toBeNull();
    }
  });

  it("a tela offline precisa passar, senão o app instalado mostra o login sem rede", async () => {
    // Quem busca `/offline` é o `install` do service worker, que pode rodar
    // antes de haver sessão: com o proxy no caminho, o que iria para o cache
    // seria o HTML do login.
    semSessao();

    expect(destino(await pedir("/offline"))).toBeNull();
  });

  it("a liberação das telas de auth também vale para as subrotas", async () => {
    semSessao();

    expect(destino(await pedir("/change-password/etapa-2"))).toBeNull();
  });
});

describe("sessão de pé", () => {
  it("quem já está dentro não volta ao login", async () => {
    // Link antigo, favorito, botão voltar: não há o que autenticar.
    comSessao("OWNER");

    expect(destino(await pedir("/login"))).toBe("/dashboard");
  });

  it("gente da plataforma que abre o login cai no console", async () => {
    comSessao("SU");

    expect(destino(await pedir("/login"))).toBe("/platform");
  });

  it("deixa passar as telas do sistema", async () => {
    comSessao("OWNER");

    expect(destino(await pedir("/orders/order-1"))).toBeNull();
  });
});

describe("gente da plataforma vive no console", () => {
  it.each(["super_user", "SU", "support", "SUPPORT"])(
    "%s digitando uma tela do tenant é desviado para /platform",
    async (role) => {
      // A empresa onde a conta dele está ancorada é detalhe do modelo, não um
      // lugar de trabalho: sem o desvio ele cairia no dashboard de uma empresa
      // qualquer.
      comSessao(role);

      expect(destino(await pedir("/dashboard"))).toBe("/platform");
    }
  );

  it("dentro do console, segue o caminho", async () => {
    comSessao("SU");

    expect(destino(await pedir("/platform/companies/tenant-1"))).toBeNull();
  });

  it("a raiz do console também é console", async () => {
    comSessao("SU");

    expect(destino(await pedir("/platform"))).toBeNull();
  });

  it("o desvio não prende a pessoa fora das telas de autenticação", async () => {
    comSessao("SU");

    expect(destino(await pedir("/change-password"))).toBeNull();
  });

  it("na sessão emprestada vale o papel do usuário personificado", async () => {
    // Durante a impersonação o token é o DELE: o SU precisa ver o sistema do
    // tenant, senão "entrar como" não serviria para nada.
    comSessao("SELLER");

    expect(destino(await pedir("/dashboard"))).toBeNull();
  });
});

describe("o que fica fora do proxy", () => {
  it.each([
    "robots.txt",
    "sitemap.xml",
    "manifest.webmanifest",
    "sw.js",
    "opengraph-image",
    "favicon.ico",
  ])("%s não passa pelo matcher", (arquivo) => {
    // Quem busca esses é um robô ou o próprio navegador, sem cookie nenhum: um
    // 307 para o login devolveria a página de login no lugar do arquivo — e no
    // caso do manifesto o sintoma é silencioso (o app deixa de ser instalável).
    const matcher = new RegExp(config.matcher[0]);
    expect(matcher.test(`/${arquivo}`)).toBe(false);
  });

  it("as telas do sistema continuam passando pelo matcher", () => {
    const matcher = new RegExp(config.matcher[0]);
    expect(matcher.test("/dashboard")).toBe(true);
    expect(matcher.test("/orders/order-1")).toBe(true);
  });
});
