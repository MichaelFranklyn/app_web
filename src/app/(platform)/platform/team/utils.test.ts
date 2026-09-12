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

  it("mostra o dia E a hora do último acesso", () => {
    // Duas ações do mesmo dia se distinguem pela hora, e é a sequência do dia
    // que se reconstrói ao investigar — por isso o rótulo traz as duas partes.
    // O instante é meio-dia UTC e a hora é conferida pelo FORMATO: a máquina
    // que roda o teste (CI em UTC, dev em BRT) não pode mudar o resultado.
    const label = lastAccessLabel(
      member({ lastLoginAt: "2026-09-12T12:00:00Z" })
    );

    expect(label).toMatch(/^12\/09\/26, \d{2}:\d{2}$/);
  });

  it("data quebrada vira traço, não 'Invalid Date'", () => {
    expect(lastAccessLabel(member({ lastLoginAt: "amanhã" }))).toBe("—");
  });
});
