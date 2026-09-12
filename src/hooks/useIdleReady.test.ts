import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIdleReady } from "./useIdleReady";

// `Omit` antes do &: no lib.dom as duas são obrigatórias, e sobre um campo
// obrigatório o `delete` do teardown não compila.
type IdleWindow = Omit<Window, "requestIdleCallback" | "cancelIdleCallback"> & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const idleWindow = window as unknown as IdleWindow;

describe("useIdleReady", () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    vi.useRealTimers();
    delete idleWindow.requestIdleCallback;
    delete idleWindow.cancelIdleCallback;
  });

  it("começa falso e só libera quando o navegador fica ocioso", () => {
    // O ponto do hook: se já nascesse true, a busca acessória voltaria a
    // competir com o conteúdo principal — exatamente o que ele evita.
    const { result } = renderHook(() => useIdleReady());
    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe(true);
  });

  it("usa requestIdleCallback quando o navegador tem a API", () => {
    const request = vi.fn((cb: () => void) => {
      cb();
      return 7;
    });
    idleWindow.requestIdleCallback =
      request as IdleWindow["requestIdleCallback"];
    idleWindow.cancelIdleCallback = vi.fn();

    const { result } = renderHook(() => useIdleReady(900));

    expect(result.current).toBe(true);
    expect(request).toHaveBeenCalledWith(expect.any(Function), {
      timeout: 900,
    });
  });

  it("cancela o callback ocioso ao desmontar", () => {
    idleWindow.requestIdleCallback = vi.fn(
      () => 42
    ) as IdleWindow["requestIdleCallback"];
    const cancel = vi.fn();
    idleWindow.cancelIdleCallback = cancel;

    const { unmount } = renderHook(() => useIdleReady());
    unmount();

    expect(cancel).toHaveBeenCalledWith(42);
  });

  it("sem a API, o timer de reserva não dispara depois do desmonte", () => {
    const { unmount, result } = renderHook(() => useIdleReady());
    unmount();

    // Sem o clearTimeout, o setReady rodaria num hook já desmontado.
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
  });
});
