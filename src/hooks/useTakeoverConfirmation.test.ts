import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTakeoverConfirmation } from "./useTakeoverConfirmation";

/**
 * A regra que este hook existe para garantir: o formulário e a confirmação
 * NUNCA estão na tela ao mesmo tempo. Cada teste olha o par
 * (formulário aberto?, confirmação aberta?) — os dois `true` juntos é o bug.
 */
const setup = () => {
  const setFormOpen = vi.fn();
  const { result } = renderHook(() => useTakeoverConfirmation({ setFormOpen }));
  return { setFormOpen, result };
};

const DRAFT = { sellerId: "s-1", factoryId: "f-1" };

describe("useTakeoverConfirmation", () => {
  it("começa sem confirmação e sem rascunho", () => {
    const { result } = setup();
    expect(result.current.confirmOpen).toBe(false);
    expect(result.current.draft).toBeNull();
  });

  it("fecha o formulário ao abrir a confirmação", () => {
    const { setFormOpen, result } = setup();

    act(() => result.current.requestConfirmation(DRAFT));

    expect(setFormOpen).toHaveBeenCalledWith(false);
    expect(result.current.confirmOpen).toBe(true);
  });

  it("guarda o formulário para devolvê-lo se o usuário desistir", () => {
    const { result } = setup();

    act(() => result.current.requestConfirmation(DRAFT));

    expect(result.current.draft).toEqual(DRAFT);
  });

  it("cancelar devolve o formulário e fecha a confirmação", () => {
    const { setFormOpen, result } = setup();
    act(() => result.current.requestConfirmation(DRAFT));

    act(() => result.current.cancelConfirmation());

    expect(setFormOpen).toHaveBeenLastCalledWith(true);
    expect(result.current.confirmOpen).toBe(false);
    // O rascunho sobrevive: é ele que reabre o formulário preenchido.
    expect(result.current.draft).toEqual(DRAFT);
  });

  it("reset não deixa rascunho nem confirmação para trás", () => {
    const { result } = setup();
    act(() => result.current.requestConfirmation(DRAFT));

    act(() => result.current.reset());

    expect(result.current.confirmOpen).toBe(false);
    expect(result.current.draft).toBeNull();
  });

  it("reset não reabre o formulário (quem salvou quer a tela livre)", () => {
    const { setFormOpen, result } = setup();
    act(() => result.current.requestConfirmation(DRAFT));
    setFormOpen.mockClear();

    act(() => result.current.reset());

    expect(setFormOpen).not.toHaveBeenCalled();
  });
});
