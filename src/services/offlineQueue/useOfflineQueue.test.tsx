import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { enqueue, getQueueState, resetQueueForTests } from "./store";
import { useOfflineEntry, useSendOrQueue } from "./useOfflineQueue";
import { visitStatusDraft } from "./utils";

const { getCookie } = vi.hoisted(() => ({ getCookie: vi.fn() }));
vi.mock("@/utils/cookies/clientCookie", () => ({ getCookie }));

const NOW = new Date("2026-09-28T14:30:00Z");
const draft = (id = "v1") =>
  visitStatusDraft({ id, status: "COMPLETED", label: "Loja" }, NOW);

const setOnline = (value: boolean) =>
  Object.defineProperty(navigator, "onLine", { configurable: true, value });

describe("useSendOrQueue", () => {
  beforeEach(() => {
    resetQueueForTests();
    getCookie.mockReturnValue({ userId: "u1" });
    setOnline(true);
  });
  afterEach(() => setOnline(true));

  it("com sinal, grava na hora e não guarda nada", async () => {
    const { result } = renderHook(() => useSendOrQueue());
    const send = vi.fn().mockResolvedValue("ok");

    const outcome = await result.current(draft(), send);

    expect(outcome).toEqual({ queued: false, result: "ok" });
    expect(getQueueState().entries).toEqual([]);
    // Com o teto de espera, para o sinal ruim não pendurar o botão.
    expect(send.mock.calls[0][0].fetchOptions.signal).toBeInstanceOf(
      AbortSignal
    );
  });

  it("sem rede na tentativa, guarda no aparelho com o dono", async () => {
    const { result } = renderHook(() => useSendOrQueue());
    const send = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    const outcome = await result.current(draft(), send);

    expect(outcome).toEqual({ queued: true });
    expect(getQueueState().entries).toEqual([
      expect.objectContaining({ key: "visit:v1", userId: "u1" }),
    ]);
  });

  it("aparelho declaradamente offline: nem tenta a rede", async () => {
    setOnline(false);
    const { result } = renderHook(() => useSendOrQueue());
    const send = vi.fn();

    const outcome = await result.current(draft(), send);

    expect(outcome).toEqual({ queued: true });
    expect(send).not.toHaveBeenCalled();
  });

  it("recusa do servidor chega a quem chamou, como antes", async () => {
    const { result } = renderHook(() => useSendOrQueue());
    const send = vi.fn().mockRejectedValue(new Error("Acesso negado"));

    await expect(result.current(draft(), send)).rejects.toThrow(
      "Acesso negado"
    );
    expect(getQueueState().entries).toEqual([]);
  });

  it("com algo já esperando, entra atrás e pede a descarga", async () => {
    enqueue({ ...draft("antiga"), userId: "u1" });
    const flush = vi.fn();
    window.addEventListener("girus:offline-queue:flush", flush);
    const { result } = renderHook(() => useSendOrQueue());
    const send = vi.fn();

    const outcome = await result.current(draft("nova"), send);

    expect(outcome).toEqual({ queued: true });
    expect(send).not.toHaveBeenCalled();
    expect(getQueueState().entries.map((e) => e.key)).toEqual([
      "visit:antiga",
      "visit:nova",
    ]);
    expect(flush).toHaveBeenCalledOnce();
    window.removeEventListener("girus:offline-queue:flush", flush);
  });

  it("sem saber quem está logado, não guarda (poderia ir na sessão de outro)", async () => {
    getCookie.mockReturnValue(null);
    const { result } = renderHook(() => useSendOrQueue());
    const send = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(result.current(draft(), send)).rejects.toThrow(TypeError);
    expect(getQueueState().entries).toEqual([]);
  });
});

describe("useOfflineEntry", () => {
  beforeEach(() => resetQueueForTests());

  it("a tela vê a resposta guardada assim que ela entra na fila", () => {
    const { result } = renderHook(() => useOfflineEntry("visit:v1"));
    expect(result.current).toBeUndefined();

    act(() => enqueue({ ...draft(), userId: "u1" }));

    expect(result.current).toMatchObject({
      variables: { status: "COMPLETED" },
    });
  });
});
