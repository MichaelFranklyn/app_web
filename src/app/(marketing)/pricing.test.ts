import { describe, expect, it } from "vitest";
import { PLANS } from "./plans";
import {
  cheaperUpgradeFor,
  extraUsersFor,
  MAX_USERS,
  monthlyTotalFor,
  parseUsers,
} from "./pricing";

const plan = (code: string) => PLANS.find((p) => p.code === code)!;
const basic = plan("basic");
const intermediate = plan("intermediate");
const corporate = plan("corporate");
const enterprise = plan("enterprise");

describe("monthlyTotalFor", () => {
  it("cobra só a mensalidade dentro dos usuários incluídos", () => {
    expect(monthlyTotalFor(basic, 1)).toBe(54.9);
    expect(monthlyTotalFor(basic, 2)).toBe(54.9);
  });

  it("soma o usuário extra sem erro de centavo", () => {
    // Básico + 1 usuário: o exemplo que motivou a calculadora.
    expect(monthlyTotalFor(basic, 3)).toBe(79.8);
    expect(monthlyTotalFor(intermediate, 7)).toBe(149.7);
  });

  it("não inventa total para o Enterprise", () => {
    expect(monthlyTotalFor(enterprise, 50)).toBeNull();
    expect(extraUsersFor(enterprise, 50)).toBe(0);
  });
});

describe("cheaperUpgradeFor", () => {
  it("não sugere nada enquanto o extra compensa", () => {
    expect(cheaperUpgradeFor(basic, 3)).toBeNull();
    expect(cheaperUpgradeFor(intermediate, 8)).toBeNull();
  });

  it("sugere o degrau de cima quando ele sai mais barato", () => {
    // Guarda da escada: se o preço do extra baixar demais, estes casos quebram
    // e a calculadora deixa de empurrar para o plano certo.
    expect(cheaperUpgradeFor(basic, 4)?.code).toBe("intermediate");
    expect(cheaperUpgradeFor(intermediate, 9)?.code).toBe("corporate");
  });

  it("nunca sugere descer de plano nem o Enterprise", () => {
    expect(cheaperUpgradeFor(corporate, 1)).toBeNull();
    expect(cheaperUpgradeFor(corporate, 30)).toBeNull();
  });
});

describe("parseUsers", () => {
  it("usa o incluído quando a URL não diz nada ou diz besteira", () => {
    expect(parseUsers(null, basic)).toBe(2);
    expect(parseUsers("abc", intermediate)).toBe(5);
  });

  it("nunca fica abaixo do incluído nem acima do teto", () => {
    expect(parseUsers("1", corporate)).toBe(10);
    expect(parseUsers("999", basic)).toBe(MAX_USERS);
    expect(parseUsers("3", basic)).toBe(3);
  });
});
