import { describe, expect, it } from "vitest";

import {
  CATALOG_GROUPS,
  CATALOG_LINKS,
  CATALOG_TONE,
  countLabel,
} from "./utils";

describe("countLabel", () => {
  it("conta no singular e no plural", () => {
    expect(countLabel(1, { one: "categoria", many: "categorias" })).toBe(
      "1 categoria"
    );
    expect(countLabel(12, { one: "categoria", many: "categorias" })).toBe(
      "12 categorias"
    );
  });

  it("catálogo vazio convida a cadastrar, em vez de mostrar '0'", () => {
    expect(countLabel(0, { one: "regra", many: "regras" })).toBe(
      "nada cadastrado ainda"
    );
  });

  it("enquanto a contagem não chegou, não escreve nada", () => {
    // `null` é "ainda carregando": um "0" aqui diria que está vazio quando
    // ainda não se sabe.
    expect(countLabel(null, { one: "regra", many: "regras" })).toBe("");
  });
});

describe("catálogos da configuração", () => {
  it("cada catálogo tem rota, cor de módulo e contagem próprias", () => {
    // O card novo que esquecer o tone ou o countKey aparece sem cor e sem
    // número — e ninguém percebe até abrir a tela.
    CATALOG_LINKS.forEach((link) => {
      expect(link.href.startsWith("/settings/catalog/")).toBe(true);
      expect(CATALOG_TONE[link.tone]).toBeDefined();
      expect(link.noun.one).not.toBe("");
      expect(link.countKey).not.toBe("");
    });
  });

  it("não repete catálogo entre os grupos", () => {
    const keys = CATALOG_LINKS.map((link) => link.countKey);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("separa produto, cliente e fiscal — é o que evita o clique errado", () => {
    // "Categorias de produtos" e "Segmentos de clientes" citam segmento nas
    // duas descrições; o agrupamento desfaz a confusão antes da leitura.
    expect(CATALOG_GROUPS.map((group) => group.title)).toEqual([
      "Produtos",
      "Clientes",
      "Fiscal",
    ]);
    expect(CATALOG_GROUPS.every((group) => group.links.length > 0)).toBe(true);
  });
});
