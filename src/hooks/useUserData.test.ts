import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUserData } from "./useUserData";

const { getCookie } = vi.hoisted(() => ({ getCookie: vi.fn() }));
vi.mock("@/utils/cookies/clientCookie", () => ({ getCookie }));

describe("useUserData", () => {
  beforeEach(() => getCookie.mockReset());

  it("no primeiro render ainda não sabe o papel", () => {
    // O cookie só é lido no efeito: ler no corpo daria mismatch de hidratação.
    // Quem condiciona UI a papel precisa tratar este estado — por isso o
    // `isSeller` é falso no PRIMEIRO render, e não indefinido. Guardamos os
    // renders porque o `result.current` já é o de depois do efeito.
    getCookie.mockReturnValue({ role: "SELLER", sellerId: "s-1" });

    const renders: ReturnType<typeof useUserData>[] = [];
    renderHook(() => {
      const value = useUserData();
      renders.push(value);
      return value;
    });

    expect(renders[0].userData).toBeNull();
    expect(renders[0].isSeller).toBe(false);
    expect(renders[0].sellerId).toBeNull();
    // E o efeito de fato roda logo em seguida — o estado inicial é transitório.
    expect(renders.at(-1)?.isSeller).toBe(true);
  });

  it("lê o cookie userData e marca o vendedor", async () => {
    getCookie.mockReturnValue({
      userId: "u-1",
      userName: "Ana",
      companyName: "Empresa",
      role: "SELLER",
      sellerId: "seller-9",
    });

    const { result } = renderHook(() => useUserData());

    await waitFor(() => expect(result.current.userData).not.toBeNull());
    expect(getCookie).toHaveBeenCalledWith("userData");
    expect(result.current.isSeller).toBe(true);
    expect(result.current.sellerId).toBe("seller-9");
  });

  it("dono que também vende: não é SELLER, mas tem perfil de vendedor", async () => {
    // Papel decide a VISÃO, perfil decide a OPERAÇÃO — são coisas distintas, e
    // o hook precisa devolver as duas separadas.
    getCookie.mockReturnValue({ role: "OWNER", sellerId: "seller-3" });

    const { result } = renderHook(() => useUserData());

    await waitFor(() => expect(result.current.sellerId).toBe("seller-3"));
    expect(result.current.isSeller).toBe(false);
  });

  it("sem cookie, devolve nulo sem estourar", async () => {
    getCookie.mockReturnValue(null);

    const { result } = renderHook(() => useUserData());

    await waitFor(() => expect(getCookie).toHaveBeenCalled());
    expect(result.current.userData).toBeNull();
    expect(result.current.sellerId).toBeNull();
  });
});
