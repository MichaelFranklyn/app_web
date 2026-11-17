import { getCookie } from "@/utils/cookies/clientCookie";
import { scrub, scrubRoute } from "./scrub";

/**
 * Relata ao backend o erro que a tela não tratou.
 *
 * O destino é `POST /client-errors` da API (`app_user/app/modules/client_errors`),
 * que grava uma linha no Cloud Logging no formato que o Error Reporting do GCP
 * agrupa e avisa quando o erro é NOVO. Ferramenta gratuita: sem fornecedor de
 * fora, sem SDK, e o log entra na cota grátis.
 *
 * `sendBeacon` com corpo `text/plain`: é requisição "simples" para o CORS (sem
 * preflight), não segura a navegação e sai mesmo com a aba fechando — o erro
 * que derruba a tela costuma vir junto com o usuário saindo dela.
 *
 * Nada aqui pode quebrar a tela: relatar é melhoria, e um erro dentro do
 * relato viraria outro relato. Toda falha é engolida.
 */

/** De onde o erro foi pego — a mesma lista do backend (`SOURCES`). */
export type ErrorSource =
  | "onerror"
  | "unhandledrejection"
  | "boundary"
  | "global-boundary";

export interface ClientErrorReport {
  name: string;
  message: string;
  stack: string;
  route: string;
  source: ErrorSource;
  role: string;
  version: string;
  digest?: string;
}

/** Uma tela quebrada em laço não pode virar centenas de relatos. */
export const MAX_REPORTS_PER_PAGE = 10;
const MAX_MESSAGE = 500;
const MAX_STACK = 4000;

/**
 * Ruído que não é defeito nosso: o aviso benigno do ResizeObserver e o
 * "Script error." de script de outra origem (extensão, tradutor), que chega
 * sem mensagem nem pilha e não diz nada.
 */
const IGNORED = [/^ResizeObserver loop/, /^Script error\.?$/];

const sent = new Set<string>();

/** Só no ar de verdade: dev, E2E e preview da Vercel ficam de fora. */
export function isReportingEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" &&
    Boolean(process.env.NEXT_PUBLIC_GRAPHQL_API_HOST)
  );
}

function endpoint(): string {
  return `${new URL(process.env.NEXT_PUBLIC_GRAPHQL_API_HOST ?? "").origin}/client-errors`;
}

/**
 * Papel de quem estava na tela — para saber se o erro é do vendedor, do dono
 * ou do cliente do portal. Só o papel: nada que identifique a pessoa.
 */
function currentRole(pathname: string): string {
  if (pathname.startsWith("/p/")) return "PORTAL";
  try {
    return getCookie<{ role?: string }>("userData")?.role ?? "anonymous";
  } catch {
    return "anonymous";
  }
}

function toError(value: unknown): {
  name: string;
  message: string;
  stack: string;
} {
  if (value instanceof Error) {
    return {
      name: value.name || "Error",
      message: value.message ?? "",
      stack: value.stack ?? "",
    };
  }
  // `Promise.reject("texto")` e afins: não é Error, não tem pilha.
  const message = typeof value === "string" ? value : safeJson(value);
  return { name: "Error", message, stack: "" };
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

/** O relato pronto para enviar, já limpo — ou null quando é ruído. */
export function buildReport(
  error: unknown,
  source: ErrorSource,
  digest?: string
): ClientErrorReport | null {
  const { name, message, stack } = toError(error);
  if (IGNORED.some((pattern) => pattern.test(message))) return null;
  if (!message && !stack) return null;
  const pathname = window.location.pathname;
  return {
    name,
    message: scrub(message).slice(0, MAX_MESSAGE),
    stack: scrub(stack).slice(0, MAX_STACK),
    route: scrubRoute(pathname),
    source,
    role: currentRole(pathname),
    version:
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "unknown",
    ...(digest ? { digest } : {}),
  };
}

/** Relata o erro uma vez por carga da página (mesmo nome + mensagem + tela). */
export function reportError(
  error: unknown,
  source: ErrorSource,
  digest?: string
): void {
  try {
    if (!isReportingEnabled()) return;
    if (sent.size >= MAX_REPORTS_PER_PAGE) return;
    const report = buildReport(error, source, digest);
    if (!report) return;
    const key = `${report.name}|${report.message}|${report.route}`;
    if (sent.has(key)) return;
    sent.add(key);
    const body = new Blob([JSON.stringify(report)], { type: "text/plain" });
    if (navigator.sendBeacon?.(endpoint(), body)) return;
    // Sem beacon (ou fila cheia): `keepalive` faz o mesmo papel.
    void fetch(endpoint(), {
      method: "POST",
      body,
      keepalive: true,
      mode: "no-cors",
    }).catch(() => {});
  } catch {
    // Relatar nunca derruba a tela.
  }
}

/** Só para os testes: zera o que já foi enviado nesta carga. */
export function resetReportedErrors(): void {
  sent.clear();
}
