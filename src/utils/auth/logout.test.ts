import { afterEach, describe, expect, it, vi } from "vitest";

import { removeCookie } from "../cookies/clientCookie";
import { clearAuthCookies, logout } from "./logout";

vi.mock("../cookies/clientCookie", () => ({ removeCookie: vi.fn() }));

afterEach(() => vi.clearAllMocks());

describe("clearAuthCookies", () => {
  it("remove os 4 cookies de auth", () => {
    clearAuthCookies();
    expect(removeCookie).toHaveBeenCalledWith("token");
    expect(removeCookie).toHaveBeenCalledWith("refresh_token");
    expect(removeCookie).toHaveBeenCalledWith("remember");
    expect(removeCookie).toHaveBeenCalledWith("userData");
    expect(vi.mocked(removeCookie)).toHaveBeenCalledTimes(4);
  });
});

describe("logout", () => {
  it("limpa cookies e redireciona p/ /login", () => {
    const replace = vi.fn();
    Object.defineProperty(window, "location", {
      value: { replace },
      writable: true,
      configurable: true,
    });
    logout();
    expect(vi.mocked(removeCookie)).toHaveBeenCalledTimes(4);
    expect(replace).toHaveBeenCalledWith("/login");
  });
});
