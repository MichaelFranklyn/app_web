import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FieldConfig, useTableFilters } from "./useTableFilters";

const replace = vi.fn();
const { state } = vi.hoisted(() => ({ state: { sp: new URLSearchParams() } }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/list",
  useSearchParams: () => state.sp,
}));

const fields: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "name", debounce: 300 },
  status: { type: "select", queryField: "status" },
};

beforeEach(() => {
  state.sp = new URLSearchParams();
  replace.mockClear();
});
afterEach(() => vi.useRealTimers());

describe("useTableFilters", () => {
  it("select aplica imediatamente (input + query + URL)", () => {
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilter("status", "ACTIVE"));
    expect(result.current.inputValues.status).toBe("ACTIVE");
    expect(result.current.queryValues.status).toBe("ACTIVE");
    expect(replace).toHaveBeenCalledWith(
      expect.stringContaining("status=ACTIVE"),
      { scroll: false }
    );
  });

  it("text faz debounce: input na hora, query/URL só após o delay", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilter("search", "abc"));
    expect(result.current.inputValues.search).toBe("abc");
    expect(result.current.queryValues.search).toBeUndefined();
    expect(replace).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    expect(result.current.queryValues.search).toBe("abc");
    expect(replace).toHaveBeenCalledWith(
      expect.stringContaining("search=abc"),
      {
        scroll: false,
      }
    );
  });

  it("debounce sucessivo cancela o timer anterior", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilter("search", "a"));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.setFilter("search", "ab")); // reseta o timer
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.queryValues.search).toBe("ab");
    // só commitou uma vez (o "a" foi cancelado)
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("value vazio remove a chave", () => {
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilter("status", "X"));
    act(() => result.current.setFilter("status", undefined));
    expect(result.current.inputValues.status).toBeUndefined();
    expect(result.current.queryValues.status).toBeUndefined();
  });

  it("setFilters grava várias chaves num único replace", () => {
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilters({ status: "ACTIVE", search: "delta" }));

    expect(result.current.inputValues).toEqual({
      status: "ACTIVE",
      search: "delta",
    });
    expect(result.current.queryValues).toEqual({
      status: "ACTIVE",
      search: "delta",
    });
    // Um replace só: chamar setFilter duas vezes faria a segunda chamada
    // sobrescrever a primeira (as duas partem do mesmo searchParams).
    expect(replace).toHaveBeenCalledTimes(1);
    const url = replace.mock.calls[0][0];
    expect(url).toContain("status=ACTIVE");
    expect(url).toContain("search=delta");
  });

  it("setFilters com valor vazio limpa a chave e mantém as outras", () => {
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilters({ status: "X", search: "y" }));
    replace.mockClear();
    act(() => result.current.setFilters({ status: undefined }));

    expect(result.current.inputValues).toEqual({ search: "y" });
    expect(result.current.queryValues).toEqual({ search: "y" });
  });

  it("setFilters leva junto o texto que ainda não venceu o debounce", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilter("search", "abc")); // arma o timer
    act(() => result.current.setFilters({ status: "ACTIVE" }));

    // Digitar a busca e escolher um filtro no mesmo painel, antes dos 300ms,
    // não pode apagar o que foi digitado: os dois valem no mesmo replace.
    expect(result.current.queryValues.search).toBe("abc");
    expect(result.current.queryValues.status).toBe("ACTIVE");
    expect(replace).toHaveBeenLastCalledWith(
      expect.stringContaining("search=abc"),
      { scroll: false }
    );

    // E o timer cancelado não dispara depois, por cima do que já foi aplicado.
    const callsBefore = replace.mock.calls.length;
    act(() => vi.advanceTimersByTime(300));
    expect(replace.mock.calls.length).toBe(callsBefore);
  });

  it("setFilters tem a última palavra quando mexe na mesma chave do texto", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilter("search", "abc"));
    act(() => result.current.setFilters({ search: undefined }));

    // É o caso do "Limpar filtros" logo depois de digitar.
    expect(result.current.queryValues.search).toBeUndefined();
    expect(result.current.inputValues.search).toBeUndefined();
  });

  it("setFilters volta para a página 1", () => {
    state.sp = new URLSearchParams("page=4");
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilters({ status: "ACTIVE" }));
    expect(replace).toHaveBeenCalledWith(expect.not.stringContaining("page="), {
      scroll: false,
    });
  });

  it("clearFilters zera estado e remove os campos da URL", () => {
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilter("status", "X"));
    replace.mockClear();
    act(() => result.current.clearFilters());
    expect(result.current.inputValues).toEqual({});
    expect(result.current.queryValues).toEqual({});
    expect(replace).toHaveBeenCalledWith("/list?", { scroll: false });
  });

  it("setPage seta page>1 e remove em page<=1", () => {
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setPage(3));
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("page=3"), {
      scroll: false,
    });
    act(() => result.current.setPage(1));
    expect(replace).toHaveBeenLastCalledWith(
      expect.not.stringContaining("page="),
      { scroll: false }
    );
  });

  it("inicializa a partir da URL, só os campos conhecidos", () => {
    state.sp = new URLSearchParams("status=ACTIVE&desconhecido=1");
    const { result } = renderHook(() => useTableFilters(fields));
    expect(result.current.inputValues).toEqual({ status: "ACTIVE" });
    expect(result.current.queryValues).toEqual({ status: "ACTIVE" });
  });

  it("clearFilters cancela um debounce de texto pendente", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilter("search", "abc")); // arma o timer
    act(() => result.current.clearFilters()); // cancela antes de disparar
    act(() => vi.advanceTimersByTime(300));
    // o commit do debounce não deve ocorrer
    expect(result.current.queryValues.search).toBeUndefined();
  });

  it("espera a URL refletir o texto commitado antes de re-sincronizar", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(() => useTableFilters(fields));
    act(() => result.current.setFilter("search", "abc"));
    act(() => vi.advanceTimersByTime(300)); // pendingFilterRef = {search, abc}

    // URL ainda não reflete o valor → efeito aguarda (committed=false).
    act(() => {
      state.sp = new URLSearchParams();
      rerender();
    });
    expect(result.current.queryValues.search).toBe("abc");

    // URL passa a refletir → efeito limpa o pending e re-sincroniza.
    act(() => {
      state.sp = new URLSearchParams("search=abc");
      rerender();
    });
    expect(result.current.queryValues.search).toBe("abc");
  });

  it("após clearFilters aguarda a URL esvaziar antes de re-sincronizar", () => {
    state.sp = new URLSearchParams("status=ACTIVE");
    const { result, rerender } = renderHook(() => useTableFilters(fields));
    act(() => result.current.clearFilters()); // clearingRef = true

    // URL ainda tem o campo → efeito segura a re-sincronização.
    act(() => {
      state.sp = new URLSearchParams("status=ACTIVE");
      rerender();
    });
    expect(result.current.queryValues).toEqual({});

    // URL limpa → efeito reseta o flag de limpeza.
    act(() => {
      state.sp = new URLSearchParams();
      rerender();
    });
    expect(result.current.queryValues).toEqual({});
  });

  it("re-sincroniza quando a URL muda (efeito)", () => {
    const { result, rerender } = renderHook(() => useTableFilters(fields));
    expect(result.current.inputValues).toEqual({});
    act(() => {
      state.sp = new URLSearchParams("status=NOVO");
      rerender();
    });
    expect(result.current.inputValues.status).toBe("NOVO");
    expect(result.current.queryValues.status).toBe("NOVO");
  });
});
