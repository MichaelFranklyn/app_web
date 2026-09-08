import { afterEach, describe, expect, it, vi } from "vitest";
import { sondarServidor } from "./utils";

/**
 * A sondagem existe porque `navigator.onLine` mente por omissão: ele diz que há
 * interface de rede, não que a internet responde. O que se testa aqui é que
 * cada jeito de "não responder" resulta em `false` — porque o custo de errar
 * para o outro lado é a tela anunciar "a conexão voltou" e o botão falhar de
 * novo.
 */
describe("sondarServidor", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("responde true quando o servidor devolve ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true } as Response));
    await expect(sondarServidor()).resolves.toBe(true);
  });

  it("responde false quando o servidor devolve erro", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false } as Response)
    );
    await expect(sondarServidor()).resolves.toBe(false);
  });

  it("responde false quando a rede recusa", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    );
    await expect(sondarServidor()).resolves.toBe(false);
  });

  it("não usa cache do navegador", async () => {
    // Sem `no-store` a sondagem responderia "voltou" a partir da resposta
    // guardada, sem ter tocado na rede — que é o único trabalho dela.
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true } as Response);
    vi.stubGlobal("fetch", fetchSpy);

    await sondarServidor();

    const [, init] = fetchSpy.mock.calls[0];
    expect(init.cache).toBe("no-store");
    expect(init.method).toBe("HEAD");
  });

  it("desiste quando a requisição fica pendurada", async () => {
    // O pior caso do sinal ruim não é a conexão recusada — é a que não
    // responde. Sem timeout a tela ficaria em "checando" para sempre.
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError"))
            );
          })
      )
    );

    vi.useFakeTimers();
    const promessa = sondarServidor();
    await vi.advanceTimersByTimeAsync(5000);

    await expect(promessa).resolves.toBe(false);
  });

  it("aponta para uma rota pública, fora do proxy", async () => {
    // Sondar uma rota autenticada devolveria o 307 do login, e `ok` seria false
    // mesmo com o servidor de pé — a tela nunca sairia de "sem conexão".
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true } as Response);
    vi.stubGlobal("fetch", fetchSpy);

    await sondarServidor();

    expect(fetchSpy.mock.calls[0][0]).toBe("/manifest.webmanifest");
  });
});
