import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { ORDER_CACHE_FIELDS } from "./cacheFields";

/**
 * Quem mexe em pedido invalida a lista INTEIRA de campos afetados.
 *
 * O bug que este teste trava: cada ponto de criação escolhia o que lembrava.
 * Criar pela lista invalidava `orders` + `orderStats`; pela ficha da fábrica, só
 * `orders`; pela visita, `orders` + `companyClient`; pela ficha do cliente, nada
 * — e ali o resumo por fábrica só mudava depois de um F5. Como a tela de origem
 * fica no cache enquanto o pedido novo abre, o que falta na lista é exatamente o
 * que o usuário vê velho.
 */
const ROOT = resolve(process.cwd(), "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!/\.tsx?$/.test(entry.name)) return [];
    if (/\.(test|spec)\.tsx?$/.test(entry.name)) return [];
    return [path];
  });
}

const files = sourceFiles(ROOT).map((path) => ({
  path: path.slice(ROOT.length + 1),
  code: readFileSync(path, "utf8"),
}));

/** Arquivos que criam, apagam ou mudam o valor de um pedido. */
const orderWriters = files.filter(({ code }) =>
  /\b(createOrder|deleteOrder|createOrderItem|confirmOrderImport)\b/.test(code)
);

describe("campos de cache de pedido", () => {
  it("cobre a lista, a ficha do cliente e a lista de clientes", () => {
    expect(ORDER_CACHE_FIELDS).toEqual([
      "orders",
      "orderStats",
      "companyClient",
      "clients",
      "clientStats",
    ]);
  });

  it("achou os pontos que escrevem pedido", () => {
    expect(orderWriters.length).toBeGreaterThan(5);
  });

  it("nenhum ponto de pedido monta a própria lista de campos", () => {
    const artesanais = orderWriters
      .filter(({ code }) =>
        // Chamada com array literal em vez da constante compartilhada.
        /invalidateClient\(\s*\[\s*["']/.test(code)
      )
      .map(({ path }) => path);
    expect(artesanais).toEqual([]);
  });
});
