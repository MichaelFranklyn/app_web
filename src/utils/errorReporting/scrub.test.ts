import { describe, expect, it } from "vitest";
import { scrub, scrubRoute } from "./scrub";

/**
 * Mesmos casos de `app_user/tests/core/test_sensitive_data.py` — as duas
 * réguas têm de dar o mesmo resultado, ou o que o front deixa passar a API
 * limpa diferente (e o agrupamento no Error Reporting se parte em dois).
 */
describe("scrub", () => {
  it("tira o email da mensagem do banco", () => {
    const limpo = scrub(
      'duplicate key value violates unique constraint "uq_email" Key (email)=(fulano.silva@gmail.com)'
    );
    expect(limpo).not.toContain("fulano");
    expect(limpo).toContain("(email)=([email])");
  });

  it("tira CPF, CNPJ e telefone com ou sem máscara", () => {
    const limpo = scrub(
      "cpf 123.456.789-09, cnpj 12.345.678/0001-90, cru 12345678000190, fone (11) 98765-4321"
    );
    for (const dado of ["789-09", "0001-90", "12345678000190", "98765-4321"]) {
      expect(limpo).not.toContain(dado);
    }
    expect(limpo.split("[número]")).toHaveLength(5);
  });

  it("tira JWT, Bearer e o valor de campo de senha", () => {
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.abc_DEF-123";
    const limpo = scrub(
      `Authorization: Bearer ${jwt}; senha=Segredo123 token=${jwt} password: hunter2`
    );
    expect(limpo).not.toContain("eyJ");
    expect(limpo).not.toContain("Segredo123");
    expect(limpo).not.toContain("hunter2");
    expect(limpo).toContain("senha=[removido]");
  });

  it("tira a query string da URL e mantém o caminho", () => {
    expect(
      scrub(
        "Falhou em https://app.itinus.com.br/clients?search=Mercadinho%20Bom&page=2#x"
      )
    ).toBe("Falhou em https://app.itinus.com.br/clients");
  });

  it("troca sequência opaca longa por [token]", () => {
    const limpo = scrub("link /p/Xk3vQ9mZ2pL8rT4wY7nB1cD5fG0hJ6s aberto");
    expect(limpo).not.toContain("Xk3vQ9");
    expect(limpo).toContain("[token]");
  });

  it("deixa a pilha do navegador intacta", () => {
    const pilha =
      "TypeError: Cannot read properties of undefined (reading 'map')\n" +
      "    at OrderList (https://app.itinus.com.br/_next/static/chunks/app/orders/page-3f2a1b.js:1:20345)\n" +
      "    at renderWithHooks (https://app.itinus.com.br/_next/static/chunks/framework-9c1d.js:9:5012)";
    expect(scrub(pilha)).toBe(pilha);
  });

  it("devolve vazio para nada", () => {
    expect(scrub(null)).toBe("");
    expect(scrub(undefined)).toBe("");
    expect(scrub("")).toBe("");
  });

  it("é idempotente: limpar duas vezes dá o mesmo que uma", () => {
    const sujo = "senha=abc fulano@x.com 123.456.789-09 Bearer xyz";
    expect(scrub(scrub(sujo))).toBe(scrub(sujo));
  });
});

describe("scrubRoute", () => {
  it("tira query, ids e o token do portal", () => {
    expect(
      scrubRoute("https://app.x/p/Xk3vQ9mZ2pL8rT4w/pedido?busca=Fulano")
    ).toBe("/p/:token/pedido");
    expect(
      scrubRoute("/orders/3fa85f64-5717-4562-b3fc-2c963f66afa6/edit")
    ).toBe("/orders/:id/edit");
    expect(scrubRoute("/clients/123")).toBe("/clients/:id");
  });

  it("mantém o dia da agenda e os nomes fixos", () => {
    expect(scrubRoute("/agenda/2026-11-17#topo")).toBe("/agenda/2026-11-17");
    expect(scrubRoute("/settings/company")).toBe("/settings/company");
    expect(scrubRoute(null)).toBe("/");
  });
});
