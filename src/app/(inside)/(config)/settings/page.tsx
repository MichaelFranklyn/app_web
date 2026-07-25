import { getDecodedTokenServer } from "@/utils/auth/jwt";
import { isAdminRole, isOwnerRole } from "@/utils/auth/roles";
import { redirect } from "next/navigation";

/**
 * O hub de configurações deixou de existir: cada assunto virou item na sidebar
 * (Empresa, Pessoas, Catálogos), então uma página só para listar atalhos era um
 * clique a mais para chegar no mesmo lugar.
 *
 * A rota continua porque os breadcrumbs das telas internas apontam "Configurações"
 * para cá — e manda para o primeiro assunto que o papel abre. Redirecionar todo
 * mundo para `/settings/company` jogaria o admin em `requireOwnerPage`, e ele
 * cairia fora de novo.
 */
const Page = async () => {
  const payload = await getDecodedTokenServer();

  if (isOwnerRole(payload?.role)) redirect("/settings/company");
  if (isAdminRole(payload?.role)) redirect("/settings/users");

  // Vendedor não tem assunto de configuração da empresa: o que é dele é o perfil.
  redirect("/profile");
};

export default Page;
