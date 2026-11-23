import { describe, expect, it } from "vitest";
import { plural } from "./plural";

describe("plural", () => {
  it("usa o singular só para 1", () => {
    expect(plural(1, "pedido", "pedidos")).toBe("1 pedido");
    expect(plural(0, "pedido", "pedidos")).toBe("0 pedidos");
    expect(plural(2, "cliente atendido", "clientes atendidos")).toBe(
      "2 clientes atendidos"
    );
  });

  it("formata o número no padrão brasileiro", () => {
    expect(plural(1234, "linha", "linhas")).toBe("1.234 linhas");
  });
});
