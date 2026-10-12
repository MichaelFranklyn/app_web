import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useScopedSelection } from "./useScopedSelection";

describe("useScopedSelection", () => {
  it("nasce vazia", () => {
    const { result } = renderHook(() => useScopedSelection());
    expect(result.current.count).toBe(0);
    expect(result.current.scopeId).toBeNull();
  });

  it("marca e desmarca dentro do mesmo escopo", () => {
    const { result } = renderHook(() => useScopedSelection());
    act(() => result.current.toggle("fabrica-1", "a"));
    act(() => result.current.toggle("fabrica-1", "b"));
    expect(result.current.ids).toEqual(["a", "b"]);

    act(() => result.current.toggle("fabrica-1", "a"));
    expect(result.current.ids).toEqual(["b"]);
  });

  it("marcar em outro escopo abandona a seleção anterior", () => {
    const { result } = renderHook(() => useScopedSelection());
    act(() => result.current.toggle("fabrica-1", "a"));
    act(() => result.current.toggle("fabrica-2", "z"));

    expect(result.current.scopeId).toBe("fabrica-2");
    expect(result.current.ids).toEqual(["z"]);
    expect(result.current.selectedIn("fabrica-1")).toBeUndefined();
    expect(result.current.selectedIn("fabrica-2")?.has("z")).toBe(true);
  });

  it("desmarcar a última linha zera o escopo", () => {
    const { result } = renderHook(() => useScopedSelection());
    act(() => result.current.toggle("fabrica-1", "a"));
    act(() => result.current.toggle("fabrica-1", "a"));
    expect(result.current.scopeId).toBeNull();
  });

  it("toggleAll marca tudo e, repetido, limpa", () => {
    const { result } = renderHook(() => useScopedSelection());
    act(() => result.current.toggleAll("fabrica-1", ["a", "b", "c"]));
    expect(result.current.count).toBe(3);

    act(() => result.current.toggleAll("fabrica-1", ["a", "b", "c"]));
    expect(result.current.count).toBe(0);
  });

  it("toggleAll de outro escopo troca a seleção em vez de somar", () => {
    const { result } = renderHook(() => useScopedSelection());
    act(() => result.current.toggleAll("fabrica-1", ["a", "b"]));
    act(() => result.current.toggleAll("fabrica-2", ["x"]));

    expect(result.current.scopeId).toBe("fabrica-2");
    expect(result.current.ids).toEqual(["x"]);
  });

  it("togglePage soma as páginas do mesmo escopo e desmarca só a página", () => {
    const { result } = renderHook(() => useScopedSelection());
    act(() => result.current.togglePage("fabrica-1", ["a", "b"]));
    act(() => result.current.togglePage("fabrica-1", ["c", "d"]));
    expect(result.current.ids).toEqual(["a", "b", "c", "d"]);

    // Página com uma linha já marcada à mão: o clique completa a página.
    act(() => result.current.toggle("fabrica-1", "a"));
    act(() => result.current.togglePage("fabrica-1", ["a", "b"]));
    expect(result.current.count).toBe(4);

    act(() => result.current.togglePage("fabrica-1", ["a", "b"]));
    expect(result.current.ids).toEqual(["c", "d"]);
  });

  it("togglePage em outro escopo troca a seleção, e a última página zera", () => {
    const { result } = renderHook(() => useScopedSelection());
    act(() => result.current.togglePage("fabrica-1", ["a"]));
    act(() => result.current.togglePage("fabrica-2", ["x", "y"]));
    expect(result.current.scopeId).toBe("fabrica-2");
    expect(result.current.ids).toEqual(["x", "y"]);

    act(() => result.current.togglePage("fabrica-2", ["x", "y"]));
    expect(result.current.scopeId).toBeNull();
  });

  it("clear esvazia", () => {
    const { result } = renderHook(() => useScopedSelection());
    act(() => result.current.toggleAll("fabrica-1", ["a", "b"]));
    act(() => result.current.clear());
    expect(result.current.count).toBe(0);
    expect(result.current.scopeId).toBeNull();
  });
});
