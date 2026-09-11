import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  requireAdminPage,
  requireOwnerPage,
  requirePlatformPage,
  requireSuPage,
} from "./roleGuard";

const { getDecodedTokenServer, redirect } = vi.hoisted(() => ({
  getDecodedTokenServer: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("./jwt", () => ({ getDecodedTokenServer }));
vi.mock("next/navigation", () => ({ redirect }));

/** O papel vem do TOKEN — grafia do banco, minúscula e com `super_user`. */
const comToken = (role: string | null) =>
  getDecodedTokenServer.mockResolvedValue(role === null ? null : { role });

beforeEach(() => {
  getDecodedTokenServer.mockReset();
  redirect.mockReset();
});

describe("requireAdminPage", () => {
  it.each(["owner", "admin", "super_user", "support"])(
    "deixa %s passar",
    async (role) => {
      comToken(role);
      await requireAdminPage();
      expect(redirect).not.toHaveBeenCalled();
    }
  );

  it("expulsa o vendedor antes de qualquer query SSR rodar", async () => {
    // Sem o guard, as queries @is_admin voltam "Acesso negado" e a página cai.
    comToken("seller");
    await requireAdminPage();
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("sem token, redireciona", async () => {
    comToken(null);
    await requireAdminPage();
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("aceita um destino próprio", async () => {
    comToken("seller");
    await requireAdminPage("/orders");
    expect(redirect).toHaveBeenCalledWith("/orders");
  });
});

describe("requireOwnerPage", () => {
  it("só o dono (e a plataforma, por herança) entra", async () => {
    for (const role of ["owner", "super_user", "support"]) {
      redirect.mockClear();
      comToken(role);
      await requireOwnerPage();
      expect(redirect, role).not.toHaveBeenCalled();
    }
  });

  it("admin não abre o cadastro da empresa", async () => {
    // As mutations correspondentes são @is_owner no backend.
    comToken("admin");
    await requireOwnerPage();
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});

describe("requirePlatformPage", () => {
  it("abre para super usuário e suporte", async () => {
    for (const role of ["super_user", "support"]) {
      redirect.mockClear();
      comToken(role);
      await requirePlatformPage();
      expect(redirect, role).not.toHaveBeenCalled();
    }
  });

  it("dono de empresa não entra no console", async () => {
    comToken("owner");
    await requirePlatformPage();
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});

describe("requireSuPage", () => {
  it("o super usuário passa, mesmo com o token escrevendo super_user", async () => {
    // A divergência de grafia (banco `super_user` × enum GraphQL `SU`) já
    // expulsou o SU de toda página admin uma vez.
    comToken("super_user");
    await requireSuPage();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("o suporte cai de volta no console, não no dashboard", async () => {
    // Ele não tem dashboard de empresa nenhuma para onde voltar.
    comToken("support");
    await requireSuPage();
    expect(redirect).toHaveBeenCalledWith("/platform");
  });
});
