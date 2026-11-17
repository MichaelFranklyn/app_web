import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/cookies/clientCookie", () => ({
  getCookie: vi.fn(() => ({ role: "SELLER", userName: "Fulano da Silva" })),
}));

import {
  MAX_REPORTS_PER_PAGE,
  buildReport,
  reportError,
  resetReportedErrors,
} from "./report";

/**
 * O relato do erro de tela (TASK-004). O que importa: só sai em produção, sai
 * limpo (sem dado de cliente), sai uma vez por erro e nunca derruba a tela.
 */
const beacon = vi.fn<(url: string, body: Blob) => boolean>(() => true);

async function sentBody(call = 0) {
  // O Blob do jsdom não tem `.text()`; o FileReader lê do mesmo jeito.
  const blob = beacon.mock.calls[call][1] as Blob;
  const text = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsText(blob);
  });
  return JSON.parse(text);
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_GRAPHQL_API_HOST", "https://api.exemplo.com/graphql");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA", "abcdef1234567890");
  Object.defineProperty(navigator, "sendBeacon", {
    value: beacon,
    configurable: true,
  });
  window.history.pushState({}, "", "/orders/123?busca=Mercadinho");
  resetReportedErrors();
  beacon.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("reportError", () => {
  it("envia à rota da API com o relato limpo", async () => {
    reportError(new TypeError("falhou para fulano@x.com"), "onerror");

    expect(beacon).toHaveBeenCalledTimes(1);
    expect(beacon.mock.calls[0][0]).toBe(
      "https://api.exemplo.com/client-errors"
    );
    const body = await sentBody();
    expect(body).toMatchObject({
      name: "TypeError",
      message: "falhou para [email]",
      route: "/orders/:id",
      source: "onerror",
      role: "SELLER",
      version: "abcdef123456",
    });
    expect(JSON.stringify(body)).not.toContain("Fulano");
    expect(JSON.stringify(body)).not.toContain("Mercadinho");
  });

  it("fica inerte fora da produção", () => {
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "preview");
    reportError(new Error("x"), "onerror");
    expect(beacon).not.toHaveBeenCalled();
  });

  it("manda o mesmo erro uma vez só por carga da página", () => {
    reportError(new Error("igual"), "onerror");
    reportError(new Error("igual"), "unhandledrejection");
    expect(beacon).toHaveBeenCalledTimes(1);
  });

  it("para no teto de relatos por página", () => {
    for (let i = 0; i < MAX_REPORTS_PER_PAGE + 5; i++) {
      reportError(new Error(`erro ${i}`), "onerror");
    }
    expect(beacon).toHaveBeenCalledTimes(MAX_REPORTS_PER_PAGE);
  });

  it("leva o digest do erro de servidor", async () => {
    reportError(new Error("ssr"), "boundary", "1234567");
    expect((await sentBody()).digest).toBe("1234567");
  });

  it("não derruba a tela quando o envio falha", () => {
    beacon.mockImplementationOnce(() => {
      throw new Error("bloqueado");
    });
    expect(() => reportError(new Error("x"), "onerror")).not.toThrow();
  });
});

describe("buildReport", () => {
  it("ignora o ruído do ResizeObserver e o Script error", () => {
    expect(
      buildReport(new Error("ResizeObserver loop limit exceeded"), "onerror")
    ).toBeNull();
    expect(buildReport("Script error.", "onerror")).toBeNull();
  });

  it("aceita rejeição que não é Error", () => {
    expect(buildReport({ motivo: "x" }, "unhandledrejection")).toMatchObject({
      name: "Error",
      message: '{"motivo":"x"}',
      stack: "",
    });
  });

  it("marca o papel PORTAL no link do cliente", () => {
    window.history.pushState({}, "", "/p/Xk3vQ9mZ2pL8rT4w/pedido");
    expect(buildReport(new Error("x"), "boundary")).toMatchObject({
      role: "PORTAL",
      route: "/p/:token/pedido",
    });
  });
});
