import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRedirectTransition } from "./useRedirectTransition";

// O mock global de next/navigation (vitest.setup) devolve um router NOVO a cada
// chamada, então o `push` dele não é observável. Aqui declaramos o nosso: o
// mock do arquivo tem precedência.
// O router é o MESMO objeto entre renders, como no App Router: é dele que sai a
// estabilidade da referência de `redirect`.
const { push, router } = vi.hoisted(() => {
  const push = vi.fn();
  return { push, router: { push } };
});
vi.mock("next/navigation", () => ({ useRouter: () => router }));

describe("useRedirectTransition", () => {
  beforeEach(() => push.mockClear());

  it("começa sem redirecionamento pendente", () => {
    const { result } = renderHook(() => useRedirectTransition());
    expect(result.current.isRedirecting).toBe(false);
  });

  it("navega para a rota pedida", () => {
    const { result } = renderHook(() => useRedirectTransition());

    act(() => result.current.redirect("/orders/order-1"));

    expect(push).toHaveBeenCalledWith("/orders/order-1");
  });

  it("mantém a mesma referência de `redirect` entre renders", () => {
    // O modal passa `redirect` para dentro de efeitos e callbacks; uma
    // referência nova a cada render os reexecutaria à toa.
    const { result, rerender } = renderHook(() => useRedirectTransition());
    const primeiro = result.current.redirect;

    rerender();

    expect(result.current.redirect).toBe(primeiro);
  });

  it("volta a não-pendente quando a navegação termina", () => {
    const { result } = renderHook(() => useRedirectTransition());

    act(() => result.current.redirect("/clients"));

    expect(result.current.isRedirecting).toBe(false);
  });
});
