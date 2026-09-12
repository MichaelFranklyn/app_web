import { CombinedGraphQLErrors } from "@apollo/client";
import { describe, expect, it } from "vitest";

import { getProductErrorMessage } from "./errors";

const graphqlError = (
  message: string,
  extensions: Record<string, unknown> = {}
) => new CombinedGraphQLErrors({ errors: [{ message, extensions }] });

describe("getProductErrorMessage", () => {
  it("troca o erro cru de SKU repetido por uma frase de gente", () => {
    // O backend gera "Product com sku 'X' já existe" — entidade e campo crus.
    const message = getProductErrorMessage(
      graphqlError("Product com sku 'CIM-50' já existe", {
        error_type: "ALREADY_EXISTS",
        field: "sku",
        value: "CIM-50",
      }),
      "Erro ao cadastrar produto"
    );

    expect(message).toBe(
      'Já existe um produto com o código "CIM-50" nesta fábrica.'
    );
  });

  it("sem o código no erro, ainda diz qual é o problema", () => {
    expect(
      getProductErrorMessage(
        graphqlError("Product já existe", {
          error_type: "ALREADY_EXISTS",
          field: "sku",
        }),
        "fallback"
      )
    ).toBe("Já existe um produto com este código nesta fábrica.");
  });

  it("duplicidade em outro campo mantém a mensagem do backend", () => {
    expect(
      getProductErrorMessage(
        graphqlError("Categoria já cadastrada", {
          error_type: "ALREADY_EXISTS",
          field: "name",
        }),
        "fallback"
      )
    ).toBe("Categoria já cadastrada");
  });

  it("erro interno não expõe o texto do servidor", () => {
    expect(
      getProductErrorMessage(
        graphqlError("psycopg2.errors.UndefinedColumn", {
          error_type: "INTERNAL_SERVER_ERROR",
        }),
        "fallback"
      )
    ).toBe("Erro interno no servidor. Tente novamente em instantes.");
  });

  it("regra de negócio já vem em português — passa direto", () => {
    // NOT_FOUND, CONFLICT, VALIDATION_ERROR e BUSINESS_RULE chegam prontos.
    expect(
      getProductErrorMessage(
        graphqlError("A unidade informada não existe.", {
          error_type: "NOT_FOUND",
        }),
        "fallback"
      )
    ).toBe("A unidade informada não existe.");
  });

  it("queda de rede vira instrução, não jargão do navegador", () => {
    expect(
      getProductErrorMessage(new Error("Failed to fetch"), "fallback")
    ).toBe(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
    );
  });

  it("erro comum mantém a própria mensagem", () => {
    expect(
      getProductErrorMessage(new Error("Informe o nome"), "fallback")
    ).toBe("Informe o nome");
  });

  it("texto solto e erro sem mensagem caem no fallback", () => {
    expect(getProductErrorMessage("Algo deu errado", "fallback")).toBe(
      "Algo deu errado"
    );
    expect(getProductErrorMessage(new Error("  "), "fallback")).toBe(
      "fallback"
    );
    expect(getProductErrorMessage(undefined, "fallback")).toBe("fallback");
  });
});
