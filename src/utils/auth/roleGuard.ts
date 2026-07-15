import { redirect } from "next/navigation";
import { getDecodedTokenServer } from "./jwt";

// Roles com acesso às telas de administração (o JWT emite em minúsculo,
// o cookie de UI em maiúsculo — normalizamos antes de comparar).
const ADMIN_ROLES = ["OWNER", "ADMIN", "SU"];

export const isAdminRole = (role?: string | null): boolean =>
  ADMIN_ROLES.includes((role ?? "").toUpperCase());

/**
 * Guard de página admin-only (server-side). Vendedor que acessar a rota é
 * redirecionado ao dashboard ANTES de qualquer query SSR — sem isso, as
 * queries `@is_admin` do backend voltam "Acesso negado" e a página crasha.
 */
export const requireAdminPage = async (): Promise<void> => {
  const payload = await getDecodedTokenServer();
  if (!isAdminRole(payload?.role)) redirect("/dashboard");
};
