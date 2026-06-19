import { CombinedGraphQLErrors } from "@apollo/client";

/**
 * Humaniza erros de mutation de produto vindos do back para o front.
 *
 * O backend já devolve mensagens em PT dentro dos GraphQL errors (com
 * `extensions.error_type`/`code` — ver `format_error` no app_user). Quando o
 * backend levanta uma exceção (SKU duplicado, categoria/unidade inválida etc.),
 * a mutation REJEITA com um `CombinedGraphQLErrors` (Apollo v4) em vez de
 * retornar `data.<mutation>.message`. Aqui extraímos a primeira mensagem e,
 * para os casos cujo texto cru é pouco amigável, devolvemos uma frase melhor.
 */

interface ErrorExtensions {
  error_type?: string;
  code?: number;
  field?: string;
  value?: string;
  entity?: string;
}

const NETWORK_HINT = /failed to fetch|networkerror|load failed|fetch failed/i;

function mapByExtensions(message: string, ext: ErrorExtensions): string {
  switch (ext.error_type) {
    case "ALREADY_EXISTS":
      // O backend gera "Product com sku 'X' já existe" (entidade/campo crus).
      if (ext.field === "sku") {
        return ext.value
          ? `Já existe um produto com o SKU "${ext.value}" nesta fábrica.`
          : "Já existe um produto com este SKU nesta fábrica.";
      }
      return message;
    case "INTERNAL_SERVER_ERROR":
      return "Erro interno no servidor. Tente novamente em instantes.";
    // NOT_FOUND, CONFLICT, VALIDATION_ERROR e BUSINESS_RULE já chegam em PT
    // claro do backend — usamos a própria mensagem.
    default:
      return message;
  }
}

export function getProductErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (CombinedGraphQLErrors.is(error)) {
    const first = error.errors[0];
    if (first) {
      const ext = (first.extensions ?? {}) as ErrorExtensions;
      const message = first.message?.trim();
      return mapByExtensions(message || fallback, ext);
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (NETWORK_HINT.test(message)) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
    }
    if (message) return message;
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  return fallback;
}
