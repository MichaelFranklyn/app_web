import { afterEach, describe, expect, it, vi } from "vitest";

import { removeCookie } from "../cookies/clientCookie";
import { logout } from "./logout";
import { deleteSession } from "./session";

vi.mock("../cookies/clientCookie", () => ({ removeCookie: vi.fn() }));
vi.mock("./session", () => ({
  deleteSession: vi.fn().mockResolvedValue(undefined),
}));

afterEach(() => vi.clearAllMocks());

describe("logout", () => {
  it("limpa o token httpOnly no servidor, os cookies client e redireciona p/ /login", async () => {
    const replace = vi.fn();
    Object.defineProperty(window, "location", {
      value: { replace },
      writable: true,
      configurable: true,
    });

    await logout();

    // token httpOnly some via rota de sessão (o client não consegue apagá-lo).
    expect(deleteSession).toHaveBeenCalledTimes(1);
    // cookies legíveis por JS limpos no client.
    expect(removeCookie).toHaveBeenCalledWith("remember");
    expect(removeCookie).toHaveBeenCalledWith("userData");
    expect(replace).toHaveBeenCalledWith("/login");
  });
});
