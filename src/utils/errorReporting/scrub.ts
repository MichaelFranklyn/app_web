/**
 * Tira do texto de um erro o que não pode sair do navegador.
 *
 * Espelho de `app_user/app/core/domain/sensitive_data.py` — mesma régua, nas
 * mesmas ordem e marcações. O front limpa ANTES de enviar (o dado do cliente
 * nem viaja), e a API limpa de novo porque a rota é pública. Mudou uma regra
 * aqui, muda lá também.
 *
 * A regra é de FORMATO, não de lista de campos: não se sabe em que frase o
 * email, o CPF ou o token vão aparecer. O preço é apagar também o que só parece
 * dado; para achar o defeito, o que importa é a pilha, e ela passa intacta.
 */

export const EMAIL = "[email]";
export const NUMBER = "[número]";
export const TOKEN = "[token]";
export const REMOVED = "[removido]";

// Ordem importa: token e URL antes de número, senão o número dentro do token é
// apagado e o resto do token sobra.
const RULES: ReadonlyArray<readonly [RegExp, string]> = [
  // `senha=...`, `token: ...`, `Authorization=...` — o valor some, o nome fica.
  [
    /\b(password|senha|passwd|token|secret|segredo|authorization|cookie|api[_-]?key)("?\s*[:=]\s*"?)[^\s"',;&]+/gi,
    `$1$2${REMOVED}`,
  ],
  [/\bBearer\s+[^\s"',;]+/gi, `Bearer ${TOKEN}`],
  // JWT: três blocos base64url, o primeiro sempre começa com `eyJ`.
  [/\beyJ[\w-]+\.[\w-]+\.[\w-]*/g, TOKEN],
  // Query string e fragmento de URL: é onde o link leva busca, filtro e token.
  [/(https?:\/\/[^\s?#"'<>]+)[?#][^\s"'<>]*/g, "$1"],
  [/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, EMAIL],
  // Sequência opaca longa (token do portal, chave, hash): 24+ caracteres sem
  // espaço misturando letra e número.
  [/\b(?=[A-Za-z_-]*\d)(?=[\d_-]*[A-Za-z])[A-Za-z0-9_-]{24,}\b/g, TOKEN],
  // CPF, CNPJ, telefone, cartão: 8+ dígitos, com ou sem máscara.
  [/(?<![\w])\+?\d(?:[\s.\-/()]{0,2}\d){7,}(?![\w])/g, NUMBER],
];

/** O texto sem os trechos que identificam pessoa, conta ou acesso. */
export function scrub(text: string | null | undefined): string {
  if (!text) return "";
  return RULES.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text
  );
}

const UUID =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DIGITS = /^\d+$/;
const OPAQUE = /^(?=.*\d)[A-Za-z0-9_-]{12,}$/;

function routeSegment(segment: string): string {
  if (UUID.test(segment) || DIGITS.test(segment)) return ":id";
  // Dia da agenda: não identifica ninguém e ajuda a reproduzir.
  if (DATE.test(segment)) return segment;
  if (OPAQUE.test(segment)) return ":token";
  return segment;
}

/**
 * Só o caminho da tela, com ids e tokens trocados por marcadores.
 *
 * `/p/AbC123...xyz/pedido?busca=Fulano` vira `/p/:token/pedido`: o link do
 * portal É a autorização do cliente, e a busca é o que ele digitou.
 */
export function scrubRoute(route: string | null | undefined): string {
  if (!route) return "/";
  const path = route
    .trim()
    .replace(/^https?:\/\/[^/]+/, "")
    .split("?", 1)[0]
    .split("#", 1)[0];
  const segments = path.split("/").filter(Boolean).map(routeSegment);
  return `/${segments.join("/")}`;
}
