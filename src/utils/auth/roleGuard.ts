import { redirect } from "next/navigation";
import { getDecodedTokenServer } from "./jwt";
import { isAdminRole, isOwnerRole, isPlatformRole, isSuRole } from "./roles";

// Predicados puros vivem em `./roles` (client-safe). Reexportados aqui para não
// quebrar quem já importava de `roleGuard`.
export { isAdminRole, isOwnerRole, isPlatformRole, isSuRole };

/**
 * Guard de página admin-only (server-side). Vendedor que acessar a rota é
 * redirecionado (default: dashboard) ANTES de qualquer query SSR — sem isso,
 * as queries `@is_admin` do backend voltam "Acesso negado" e a página crasha.
 */
export const requireAdminPage = async (
  redirectTo: string = "/dashboard"
): Promise<void> => {
  const payload = await getDecodedTokenServer();
  if (!isAdminRole(payload?.role)) redirect(redirectTo);
};

/** Guard das telas que só o dono da conta pode abrir (ex.: dados da empresa). */
export const requireOwnerPage = async (
  redirectTo: string = "/dashboard"
): Promise<void> => {
  const payload = await getDecodedTokenServer();
  if (!isOwnerRole(payload?.role)) redirect(redirectTo);
};

/**
 * Guard do console da plataforma (`/platform`) — super usuário OU suporte.
 *
 * Lê o papel do TOKEN, não do cookie `userData`: este último é legível e
 * gravável por JavaScript (é o que o `DevRoleSwitch` reescreve em dev), então um
 * gate baseado nele é decoração. O backend barra de qualquer forma
 * (`@is_platform_user`); aqui é o que evita a tela abrir e só depois estourar
 * erro em cada query.
 */
export const requirePlatformPage = async (
  redirectTo: string = "/dashboard"
): Promise<void> => {
  const payload = await getDecodedTokenServer();
  if (!isPlatformRole(payload?.role)) redirect(redirectTo);
};

/**
 * Guard das telas que só o SUPER USUÁRIO abre — hoje apenas a equipe da
 * plataforma. O redirect vai para o console, não para o dashboard: quem cai
 * aqui é o suporte, e ele não tem dashboard de empresa nenhuma para onde voltar.
 */
export const requireSuPage = async (
  redirectTo: string = "/platform"
): Promise<void> => {
  const payload = await getDecodedTokenServer();
  if (!isSuRole(payload?.role)) redirect(redirectTo);
};
