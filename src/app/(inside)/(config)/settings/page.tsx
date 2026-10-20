import { getDecodedTokenServer } from "@/utils/auth/jwt";
import { isAdminRole, isOwnerRole } from "@/utils/auth/roles";
import { redirect } from "next/navigation";

/**
 * A porta da área: o item "Configurações" da sidebar e os breadcrumbs das telas
 * internas apontam para cá. Não há tela própria — o menu da área (`layout.tsx`)
 * já lista as telas, então isto manda para a primeira que o papel abre. Redirecionar todo
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
