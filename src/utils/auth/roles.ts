// Predicados PUROS de papel — sem dependência de `next/headers`/cookies, para
// poder rodar tanto no server quanto no client. Os guards de página
// (require*Page), que leem o token via cookie server-side, vivem em `roleGuard`.

// Roles com acesso às telas de administração (o JWT emite em minúsculo,
// o cookie de UI em maiúsculo — normalizamos antes de comparar).
const ADMIN_ROLES = ["OWNER", "ADMIN", "SU"];

export const isAdminRole = (role?: string | null): boolean =>
  ADMIN_ROLES.includes((role ?? "").toUpperCase());

// Dono da conta (e SU por herança). Mais restrito que admin: as mutations que
// mexem no cadastro da própria empresa são `@is_owner` no backend.
const OWNER_ROLES = ["OWNER", "SU"];

export const isOwnerRole = (role?: string | null): boolean =>
  OWNER_ROLES.includes((role ?? "").toUpperCase());
