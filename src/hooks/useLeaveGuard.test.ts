import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import { isOnLeaveSentinel, useLeaveGuard } from "./useLeaveGuard";

const run = (isDirty: boolean) =>
  renderHook(({ dirty }) => useLeaveGuard(dirty), {
    initialProps: { dirty: isDirty },
  });

/** Um link de verdade no documento, clicado como o usuário clicaria. */
const clickLink = (href: string) => {
  const anchor = document.createElement("a");
  anchor.href = href;
  document.body.appendChild(anchor);
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  act(() => {
    anchor.dispatchEvent(event);
  });
  anchor.remove();
  return event;
};

/** O navegador voltou da sentinela para a entrada da tela. */
const pressBack = () =>
  act(() => {
    window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
  });

beforeEach(() => {
  vi.clearAllMocks();
  // Cada teste começa numa entrada limpa, sem sentinela de outro teste.
  window.history.replaceState(null, "", "/orders/new");
});

afterEach(() => vi.restoreAllMocks());

describe("useLeaveGuard", () => {
  it("sem nada a perder, não segura nada", () => {
    const { result } = run(false);
    const leave = vi.fn();

    act(() => result.current.guard(leave));

    expect(leave).toHaveBeenCalledOnce();
    expect(result.current.isAsking).toBe(false);
    expect(isOnLeaveSentinel()).toBe(false);
    expect(clickLink("/orders").defaultPrevented).toBe(false);
  });

  it("com algo a perder, o Cancelar pergunta antes de sair", () => {
    const { result } = run(true);

    act(() => result.current.navigate("/orders"));

    expect(result.current.isAsking).toBe(true);
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("confirmado, sai — e o destino toma o lugar da sentinela", () => {
    const { result } = run(true);
    expect(isOnLeaveSentinel()).toBe(true);

    act(() => result.current.navigate("/orders"));
    act(() => result.current.confirmLeave());

    // Replace, não push: o "Voltar" de lá não pode cair numa cópia desta tela.
    expect(router.replace).toHaveBeenCalledWith("/orders");
    expect(result.current.isAsking).toBe(false);
  });

  it("'continuar' fica na tela sem ir a lugar nenhum", () => {
    const { result } = run(true);

    act(() => result.current.navigate("/orders"));
    act(() => result.current.stay());

    expect(result.current.isAsking).toBe(false);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("clique num link interno é barrado e vira pergunta", () => {
    const { result } = run(true);

    const event = clickLink("/clients");

    expect(event.defaultPrevented).toBe(true);
    expect(result.current.isAsking).toBe(true);

    act(() => result.current.confirmLeave());
    expect(router.replace).toHaveBeenCalledWith("/clients");
  });

  it("link para outro site segue livre (quem avisa é o navegador)", () => {
    run(true);
    expect(clickLink("https://outro.site/x").defaultPrevented).toBe(false);
  });

  it("Voltar pergunta, e confirmado recua a tela e a sentinela", () => {
    const go = vi.spyOn(window.history, "go").mockImplementation(() => {});
    const { result } = run(true);

    pressBack();

    expect(result.current.isAsking).toBe(true);
    // Rearmou: um segundo "voltar" também seria segurado.
    expect(isOnLeaveSentinel()).toBe(true);

    act(() => result.current.confirmLeave());
    expect(go).toHaveBeenCalledWith(-2);
  });

  it("sem nada mais a perder, o Voltar segue sozinho (sem exigir dois cliques)", () => {
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    const { result, rerender } = run(true);

    // O vendedor apagou os itens: a sentinela ficou para trás.
    rerender({ dirty: false });
    pressBack();

    expect(back).toHaveBeenCalledOnce();
    expect(result.current.isAsking).toBe(false);
  });

  it("recarregar ou fechar a aba dispara o aviso do navegador", () => {
    run(true);
    const event = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("sem nada a perder, recarregar é livre", () => {
    run(false);
    const event = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
