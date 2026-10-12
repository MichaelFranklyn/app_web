import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCommissionsMonth, useMonthFallback } from "./useCommissionsMonth";

/**
 * O navegador e o recuo juntos, como a tela os usa. `hasMovement` é a resposta
 * do servidor para o mês aberto ("alguma comissão cai nele?").
 */
const useNavWithFallback = (
  hasMovement: boolean | null,
  latestReceiveDate: string | null
) => {
  const nav = useCommissionsMonth();
  useMonthFallback(nav, hasMovement, latestReceiveDate);
  return nav;
};

describe("useCommissionsMonth", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-12T15:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("abre no mês de hoje", () => {
    const { result } = renderHook(() => useCommissionsMonth());
    expect(result.current.month).toEqual({ year: 2026, month: 10 });
    expect(result.current.isCurrentMonth).toBe(true);
    expect(result.current.isPinned).toBe(false);
  });

  it("navegar fixa o mês e atravessa o ano", () => {
    const { result } = renderHook(() => useCommissionsMonth());
    act(() => result.current.goNext());
    act(() => result.current.goNext());
    act(() => result.current.goNext());
    expect(result.current.month).toEqual({ year: 2027, month: 1 });
    expect(result.current.isCurrentMonth).toBe(false);
    expect(result.current.isPinned).toBe(true);

    act(() => result.current.goToday());
    expect(result.current.month).toEqual({ year: 2026, month: 10 });
    act(() => result.current.goPrevious());
    expect(result.current.month).toEqual({ year: 2026, month: 9 });
  });

  it("mês de hoje vazio recua para o último com movimento", () => {
    const { result } = renderHook(() =>
      useNavWithFallback(false, "2026-08-20")
    );
    expect(result.current.month).toEqual({ year: 2026, month: 8 });
    expect(result.current.isPinned).toBe(true);
  });

  it("comissão lançada para o futuro não tira a tela do mês de hoje", () => {
    const { result } = renderHook(() =>
      useNavWithFallback(false, "2026-11-05")
    );
    expect(result.current.month).toEqual({ year: 2026, month: 10 });
    expect(result.current.isPinned).toBe(true);
  });

  it("com movimento no mês de hoje, fica onde está", () => {
    const { result } = renderHook(() => useNavWithFallback(true, "2026-10-03"));
    expect(result.current.month).toEqual({ year: 2026, month: 10 });
  });

  it("sem resposta do servidor ainda não decide nada", () => {
    const { result } = renderHook(() => useNavWithFallback(null, null));
    expect(result.current.isPinned).toBe(false);
  });

  it("a resposta de OUTRO mês ainda na tela não decide o recuo", () => {
    // Enquanto o mês pedido carrega, a tela mostra o anterior: decidir com ele
    // recuaria pelo motivo errado. Sem `hasMovement`, espera.
    const { result, rerender } = renderHook(
      ({ has }: { has: boolean | null }) =>
        useNavWithFallback(has, "2026-08-20"),
      { initialProps: { has: null as boolean | null } }
    );
    expect(result.current.isPinned).toBe(false);

    rerender({ has: false });
    expect(result.current.month).toEqual({ year: 2026, month: 8 });
  });

  it("depois de a pessoa navegar, o recuo não mexe mais no mês", () => {
    const { result, rerender } = renderHook(
      ({ latest }: { latest: string | null }) =>
        useNavWithFallback(false, latest),
      { initialProps: { latest: null as string | null } }
    );
    act(() => result.current.goNext());
    rerender({ latest: "2026-08-20" });
    expect(result.current.month).toEqual({ year: 2026, month: 11 });
  });
});
