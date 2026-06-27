import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useLocalStorage } from "./useLocalStorage";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("useLocalStorage", () => {
  it("usa o default quando a chave está vazia", () => {
    const { result } = renderHook(() => useLocalStorage("k", "def"));
    expect(result.current[0]).toBe("def");
  });

  it("persiste e relê o valor", () => {
    const { result } = renderHook(() => useLocalStorage<number>("n", 0));
    act(() => result.current[1](42));
    expect(result.current[0]).toBe(42);
    expect(JSON.parse(localStorage.getItem("n")!)).toBe(42);
  });

  it("remove e volta ao default", () => {
    const { result } = renderHook(() => useLocalStorage("k", "def"));
    act(() => result.current[1]("v"));
    act(() => result.current[2]());
    expect(result.current[0]).toBe("def");
    expect(localStorage.getItem("k")).toBeNull();
  });

  it("lê um valor pré-existente no storage", () => {
    localStorage.setItem("pre", JSON.stringify({ x: 1 }));
    const { result } = renderHook(() =>
      useLocalStorage<{ x: number } | null>("pre", null)
    );
    expect(result.current[0]).toEqual({ x: 1 });
  });

  it("cai no default quando o storage tem JSON inválido", () => {
    localStorage.setItem("bad", "{não-é-json");
    const { result } = renderHook(() => useLocalStorage("bad", "def"));
    expect(result.current[0]).toBe("def");
  });

  it("sincroniza ao receber o evento de storage", () => {
    const { result } = renderHook(() => useLocalStorage("sync", "init"));
    act(() => {
      localStorage.setItem("sync", JSON.stringify("externo"));
      window.dispatchEvent(new Event("local-storage"));
    });
    expect(result.current[0]).toBe("externo");
  });

  it("não quebra quando setItem lança (quota)", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });
    const { result } = renderHook(() => useLocalStorage("k", "def"));
    expect(() => act(() => result.current[1]("v"))).not.toThrow();
    spy.mockRestore();
  });

  it("não quebra quando removeItem lança", () => {
    const { result } = renderHook(() => useLocalStorage("k", "def"));
    const spy = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("falha");
      });
    expect(() => act(() => result.current[2]())).not.toThrow();
    spy.mockRestore();
  });
});
