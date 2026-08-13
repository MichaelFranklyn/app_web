// Cliente da rota /api/session. Centraliza o POST (estabelecer sessão via
// mutation server-side + cookie httpOnly) e o DELETE (logout), para os fluxos de
// login/signup/change-password e o logout não repetirem o fetch.

export interface SessionBody {
  action:
    | "login"
    | "signup"
    | "changePassword"
    // Troca a sessão do SU pela de outro usuário, e a volta. Não são
    // autenticação: rodam com o token atual e mexem nos cookies da sessão
    // guardada. Ver `startImpersonation` na rota.
    | "impersonate"
    | "stopImpersonation";
  // `object` (não Record) para aceitar tanto literais quanto os inputs tipados
  // (ex.: RegisterCompanyInput) sem cast; é só payload de transporte serializado.
  // Ausente em `stopImpersonation`, que não recebe nada.
  input?: object;
  remember?: boolean;
}

interface SessionResult {
  status: boolean;
  message?: string;
  userData?: Record<string, unknown>;
}

/**
 * Estabelece a sessão. Lança em falha (mensagem do backend ou o fallback) para o
 * `useAsyncAction` converter em toast de erro.
 */
export async function postSession(
  body: SessionBody,
  fallbackError: string
): Promise<SessionResult> {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as SessionResult | null;
  if (!res.ok || !json?.status) {
    throw new Error(json?.message ?? fallbackError);
  }
  return json;
}

/** Derruba a sessão (limpa o cookie httpOnly no servidor). Best-effort. */
export async function deleteSession(): Promise<void> {
  try {
    await fetch("/api/session", { method: "DELETE" });
  } catch {
    // Mesmo se falhar, o chamador segue para /login.
  }
}
