import { redirect } from "next/navigation";
import { getDecodedTokenServer } from "./jwt";
import { isAdminRole, isOwnerRole } from "./roles";

// Predicados puros vivem em `./roles` (client-safe). Reexportados aqui para não
// quebrar quem já importava de `roleGuard`.
export { isAdminRole, isOwnerRole };

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
