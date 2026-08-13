import { describe, expect, it } from "vitest";
import { isAdminRole, isOwnerRole, isPlatformRole, isSuRole } from "./roles";

/**
 * O ponto sensível é a dupla grafia do SU: o JWT traz `super_user` (valor de
 * banco) e o cookie `userData` traz `SU` (nome do enum GraphQL). Os demais
 * papéis têm valor e nome iguais a menos de caixa, e por isso nunca expuseram
 * a diferença.
 */
describe("normalização de papel", () => {
  it.each(["SU", "su", "super_user", "SUPER_USER"])(
    "reconhece %s como super usuário",
    (role) => {
      expect(isSuRole(role)).toBe(true);
    }
  );

  it.each(["OWNER", "ADMIN", "SELLER", "", null, undefined])(
    "não confunde %s com super usuário",
    (role) => {
      expect(isSuRole(role)).toBe(false);
    }
  );

  it("o SU vindo do JWT passa nos guards de admin", () => {
    // Regressão: com a comparação crua, `super_user` virava `SUPER_USER`, não
    // batia com nada e o SU era redirecionado para fora de /settings/users.
    expect(isAdminRole("super_user")).toBe(true);
    expect(isOwnerRole("super_user")).toBe(true);
  });
});

describe("isAdminRole", () => {
  it.each(["OWNER", "owner", "ADMIN", "admin", "SU"])("aceita %s", (role) => {
    expect(isAdminRole(role)).toBe(true);
  });

  it.each(["SELLER", "seller", "", null, undefined, "qualquer"])(
    "recusa %s",
    (role) => {
      expect(isAdminRole(role)).toBe(false);
    }
  );
});

describe("isOwnerRole", () => {
  it.each(["OWNER", "owner", "SU", "super_user"])("aceita %s", (role) => {
    expect(isOwnerRole(role)).toBe(true);
  });

  it.each(["ADMIN", "admin", "SELLER", null, undefined])(
    "recusa %s",
    (role) => {
      expect(isOwnerRole(role)).toBe(false);
    }
  );
});

/**
 * A fronteira entre os dois papéis de plataforma. Cada asserção aqui espelha
 * uma no backend (`tests/modules/test_platform_staff.py`): o suporte abre o
 * console inteiro e para na gestão da própria equipe.
 */
describe("isPlatformRole", () => {
  it.each(["SU", "su", "super_user", "SUPPORT", "support"])(
    "aceita %s",
    (role) => {
      expect(isPlatformRole(role)).toBe(true);
    }
  );

  it.each(["OWNER", "ADMIN", "SELLER", "", null, undefined])(
    "recusa %s",
    (role) => {
      expect(isPlatformRole(role)).toBe(false);
    }
  );
});

describe("suporte não é super usuário", () => {
  it("abre o console", () => {
    expect(isPlatformRole("support")).toBe(true);
  });

  it("não passa no guard estrito de SU", () => {
    // É a única diferença entre os dois papéis: quem manda na equipe. Trocar
    // `isSuRole` por `isPlatformRole` na página de equipe abriria a criação de
    // contas de plataforma para o próprio suporte.
    expect(isSuRole("support")).toBe(false);
    expect(isSuRole("SUPPORT")).toBe(false);
  });

  it("herda os guards de administração, como o SU", () => {
    // O suporte opera dentro do console com o mesmo alcance; barrá-lo nos
    // guards de admin produziria 403 em telas que ele pode ver.
    expect(isAdminRole("support")).toBe(true);
    expect(isOwnerRole("support")).toBe(true);
  });
});
