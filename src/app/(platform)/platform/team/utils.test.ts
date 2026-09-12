import { describe, expect, it } from "vitest";

import { PlatformStaffMember } from "./interface";
import { canManage, lastAccessLabel, STAFF_ROLE_LABEL } from "./utils";

const member = (
  overrides: Partial<PlatformStaffMember> = {}
): PlatformStaffMember =>
  ({
    id: "u1",
    name: "Suporte 1",
    email: "suporte@girus.app",
    role: "SUPPORT",
    isActive: true,
    lastLoginAt: null,
    ...overrides,
  }) as PlatformStaffMember;

describe("canManage", () => {
  it("conta de suporte pode ser gerida", () => {
    expect(canManage(member(), "eu")).toBe(true);
  });

  it("conta de SU não se altera pela tela", () => {
    // A recusa é do backend (`setPlatformUserStatus`); a tela nem oferece o
    // botão — dois cliques trancariam a plataforma fora dela mesma.
    expect(canManage(member({ role: "SU" }), "eu")).toBe(false);
  });

  it("ninguém desativa a si mesmo", () => {
    expect(canManage(member({ id: "eu" }), "eu")).toBe(false);
  });

  it("nomeia os dois papéis da equipe", () => {
    expect(STAFF_ROLE_LABEL.SU).toBe("Super Admin");
    expect(STAFF_ROLE_LABEL.SUPPORT).toBe("Suporte");
  });
});

describe("lastAccessLabel", () => {
  it("quem nunca entrou não é o mesmo que conta esquecida", () => {
    expect(lastAccessLabel(member({ lastLoginAt: null }))).toBe("Nunca entrou");
  });

  it("mostra o dia e a hora do último acesso", () => {
    const label = lastAccessLabel(
      member({ lastLoginAt: "2026-09-12T14:30:00-03:00" })
    );

    expect(label).toMatch(/12\/09\/26/);
    expect(label).toMatch(/14:30/);
  });

  it("data quebrada vira traço, não 'Invalid Date'", () => {
    expect(lastAccessLabel(member({ lastLoginAt: "amanhã" }))).toBe("—");
  });
});
