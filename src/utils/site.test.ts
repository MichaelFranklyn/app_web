import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSiteUrl,
  MARKETING_ROUTES,
  PUBLIC_MARKETING_ROUTES,
  UNLISTED_MARKETING_ROUTES,
} from "./site";

afterEach(() => vi.unstubAllEnvs());

describe("rotas públicas", () => {
  it("o que o proxy libera é a soma do que o sitemap anuncia com o não listado", () => {
    // Separar as listas faria uma página nova entrar no sitemap enquanto o
    // proxy a mandava para o login.
    expect(PUBLIC_MARKETING_ROUTES).toEqual([
      ...MARKETING_ROUTES,
      ...UNLISTED_MARKETING_ROUTES,
    ]);
  });

  it("a contratação é pública mas fica fora do sitemap", () => {
    // Anunciá-la ao buscador a colocaria na busca no lugar da página de preços.
    expect(UNLISTED_MARKETING_ROUTES).toContain("/assinar");
    expect(MARKETING_ROUTES).not.toContain("/assinar");
    expect(PUBLIC_MARKETING_ROUTES).toContain("/assinar");
  });

  it("nenhuma rota privada entrou na lista pública", () => {
    const privadas = ["/dashboard", "/orders", "/clients", "/platform"];
    for (const rota of privadas) {
      expect(PUBLIC_MARKETING_ROUTES).not.toContain(rota);
    }
  });

  it("toda rota pública é um caminho absoluto sem barra final", () => {
    // O proxy compara por igualdade exata: "/termos/" nunca casaria.
    for (const rota of PUBLIC_MARKETING_ROUTES) {
      expect(rota.startsWith("/")).toBe(true);
      if (rota !== "/") expect(rota.endsWith("/")).toBe(false);
    }
  });
});

describe("getSiteUrl", () => {
  it("prefere o domínio próprio quando declarado", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://girus.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "projeto.vercel.app");

    expect(getSiteUrl()).toBe("https://girus.app");
  });

  it("tira a barra final do domínio declarado", () => {
    // Ela viraria "https://girus.app//termos" nas tags OpenGraph.
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://girus.app/");

    expect(getSiteUrl()).toBe("https://girus.app");
  });

  it("sem domínio próprio, usa o da Vercel e completa o esquema", () => {
    // A variável da Vercel vem SEM esquema; sem o https:// a URL não é absoluta
    // e o card de link sai com a imagem quebrada.
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "projeto.vercel.app");

    expect(getSiteUrl()).toBe("https://projeto.vercel.app");
  });

  it("sem nada configurado, cai no desenvolvimento local", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");

    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
