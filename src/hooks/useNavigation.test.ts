import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const { state } = vi.hoisted(() => ({
  state: { pathname: "/clients", query: "page=2" },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => state.pathname,
  useSearchParams: () => new URLSearchParams(state.query),
}));

import { useNavigation } from "./useNavigation";

afterEach(() => {
  push.mockClear();
  sessionStorage.clear();
});

describe("useNavigation", () => {
  it("navigateTo salva a URL atual (com query) e empurra o destino", () => {
    const { result } = renderHook(() => useNavigation());
    act(() => result.current.navigateTo("/clients/1"));
    expect(sessionStorage.getItem("back_url_clients")).toBe("/clients?page=2");
    expect(push).toHaveBeenCalledWith("/clients/1");
  });

  it("navigateTo sem query salva apenas o pathname", () => {
    state.query = "";
    const { result } = renderHook(() => useNavigation());
    act(() => result.current.navigateTo("/clients/9"));
    expect(sessionStorage.getItem("back_url_clients")).toBe("/clients");
    state.query = "page=2"; // restaura p/ os demais testes
  });

  it("navigateTo com saveCurrentState=false não grava nada", () => {
    const { result } = renderHook(() => useNavigation());
    act(() => result.current.navigateTo("/x", false));
    expect(sessionStorage.getItem("back_url_clients")).toBeNull();
    expect(push).toHaveBeenCalledWith("/x");
  });

  it("navigateBack usa a URL salva quando existe", () => {
    sessionStorage.setItem("back_url_clients", "/clients?page=2");
    const { result } = renderHook(() => useNavigation());
    act(() => result.current.navigateBack("/clients"));
    expect(push).toHaveBeenCalledWith("/clients?page=2");
  });

  it("navigateBack cai no fallback sem URL salva", () => {
    const { result } = renderHook(() => useNavigation());
    act(() => result.current.navigateBack("/clients"));
    expect(push).toHaveBeenCalledWith("/clients");
  });
});
