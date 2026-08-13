// Predicados PUROS de papel — sem dependência de `next/headers`/cookies, para
// poder rodar tanto no server quanto no client. Os guards de página
// (require*Page), que leem o token via cookie server-side, vivem em `roleGuard`.

/**
 * O papel chega ao front por DOIS caminhos, com grafias diferentes:
 *
 * - **JWT** (`token`, lido pelos guards de página) traz o valor gravado no
 *   banco: `owner`, `admin`, `seller` e — a exceção — `super_user`.
 * - **Cookie `userData`** (lido pela UI) traz o NOME do enum GraphQL, que o
 *   Ariadne serializa em maiúsculas: `OWNER`, `ADMIN`, `SELLER`, `SU`.
 *
 * Nos três primeiros papéis um `toUpperCase()` bastava, e é por isso que a
 * divergência passou despercebida: só o SU tem valor e nome diferentes. O
 * efeito era o super usuário ser expulso de toda página `requireAdminPage` —
 * o token dizia `SUPER_USER`, que não estava em lista nenhuma.
 */
const normalizeRole = (role?: string | null): string => {
  const upper = (role ?? "").toUpperCase();
  return upper === "SUPER_USER" ? "SU" : upper;
};

// Gente da PLATAFORMA, acima de qualquer empresa: super usuário e suporte.
//
// O suporte só precisou de normalização por sorte — `support` e `SUPPORT` viram
// a mesma coisa no `toUpperCase()`, ao contrário do SU, cujo valor de banco
// (`super_user`) difere do nome do enum GraphQL (`SU`).
const PLATFORM_ROLES = ["SU", "SUPPORT"];

// Roles com acesso às telas de administração.
const ADMIN_ROLES = ["OWNER", "ADMIN", ...PLATFORM_ROLES];

export const isAdminRole = (role?: string | null): boolean =>
  ADMIN_ROLES.includes(normalizeRole(role));

// Dono da conta (e a plataforma por herança). Mais restrito que admin: as
// mutations que mexem no cadastro da própria empresa são `@is_owner` no backend.
const OWNER_ROLES = ["OWNER", ...PLATFORM_ROLES];

export const isOwnerRole = (role?: string | null): boolean =>
  OWNER_ROLES.includes(normalizeRole(role));

/**
 * Quem abre o console. Espelha `@is_platform_user` no backend.
 *
 * É este o predicado da subárvore `/platform` inteira — o suporte faz lá tudo o
 * que o SU faz, inclusive suspender empresa e entrar como usuário.
 */
export const isPlatformRole = (role?: string | null): boolean =>
  PLATFORM_ROLES.includes(normalizeRole(role));

/**
 * SOMENTE o super usuário. Espelha `@is_super_user`, que no backend sobrou para
 * duas operações: criar e desativar conta de plataforma.
 *
 * Usar este onde cabia `isPlatformRole` tranca o suporte fora de uma tela sem
 * ganho nenhum de segurança — ele já pode fazer aquilo por outro caminho.
 */
export const isSuRole = (role?: string | null): boolean =>
  normalizeRole(role) === "SU";
