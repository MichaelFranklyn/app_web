import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announceNavigation } from "./navigationSignal";
import { NavigationProgress } from "./NavigationProgress";
import { useNavigationPending } from "./useNavigationPending";

const mocks = vi.hoisted(() => ({ pathname: "/clients", search: "" }));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useSearchParams: () => new URLSearchParams(mocks.search),
}));

const link = (href: string, attributes: Record<string, string> = {}) => {
  const anchor = document.createElement("a");
  anchor.href = href;
  Object.entries(attributes).forEach(([name, value]) =>
    anchor.setAttribute(name, value)
  );
  anchor.innerHTML = "<span>abrir</span>";
  anchor.addEventListener("click", (event) => event.preventDefault());
  document.body.appendChild(anchor);
  return anchor;
};

describe("useNavigationPending", () => {
  beforeEach(() => {
    mocks.pathname = "/clients";
    mocks.search = "";
    window.history.replaceState(null, "", "/clients");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  it("liga no clique num link interno e desliga quando a rota troca", () => {
    const { result, rerender } = renderHook(() => useNavigationPending());
    expect(result.current).toBe(false);

    act(() => fireEvent.click(link("/clients/1").firstChild as Element));
    expect(result.current).toBe(true);

    mocks.pathname = "/clients/1";
    rerender();
    expect(result.current).toBe(false);
  });

  it("também termina quando só a query muda", () => {
    const { result, rerender } = renderHook(() => useNavigationPending());

    act(() => fireEvent.click(link("/clients?page=2")));
    expect(result.current).toBe(true);

    mocks.search = "page=2";
    rerender();
    expect(result.current).toBe(false);
  });

  it.each([
    ["outro site", () => fireEvent.click(link("https://outro.site/x"))],
    [
      "nova aba",
      () => fireEvent.click(link("/clients/1", { target: "_blank" })),
    ],
    ["download", () => fireEvent.click(link("/arquivo.pdf", { download: "" }))],
    ["a mesma página", () => fireEvent.click(link("/clients#topo"))],
    [
      "clique com Ctrl",
      () => fireEvent.click(link("/clients/1"), { ctrlKey: true }),
    ],
    ["botão do meio", () => fireEvent.click(link("/clients/1"), { button: 1 })],
    ["algo que não é link", () => fireEvent.click(document.body)],
  ])("ignora clique em %s", (_, click) => {
    const { result } = renderHook(() => useNavigationPending());
    act(click);
    expect(result.current).toBe(false);
  });

  it("liga com navegação anunciada por código (router.push de aba)", () => {
    const { result, rerender } = renderHook(() => useNavigationPending());

    act(() => announceNavigation("/clients?tab=orders"));
    expect(result.current).toBe(true);

    mocks.search = "tab=orders";
    rerender();
    expect(result.current).toBe(false);
  });

  it("ignora anúncio para a página já aberta", () => {
    const { result } = renderHook(() => useNavigationPending());
    act(() => announceNavigation("/clients"));
    expect(result.current).toBe(false);
  });

  it("desiste depois de 45 segundos", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNavigationPending());

    act(() => fireEvent.click(link("/clients/1")));
    act(() => vi.advanceTimersByTime(44_999));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(false);
  });

  it("aciona a barra de progresso da casca", () => {
    render(<NavigationProgress />);
    act(() => fireEvent.click(link("/clients/1")));
    expect(
      screen.getByRole("progressbar", { name: "Carregando a página" })
    ).toHaveAttribute("aria-hidden", "false");
  });
});
