import { getDecodedTokenServer } from "@/utils/auth/jwt";
import { settingsHomeHref } from "../../navConfig";
import { redirect } from "next/navigation";

/**
 * A porta da área: os breadcrumbs das telas internas apontam para cá (a
 * sidebar já aponta direto para a tela final, sem passar por este redirect). Não há tela própria — o menu da área (`layout.tsx`)
 * já lista as telas, então isto manda para a primeira que o papel abre. Redirecionar todo
 * mundo para `/settings/company` jogaria o admin em `requireOwnerPage`, e ele
 * cairia fora de novo.
 */
const Page = async () => {
  const payload = await getDecodedTokenServer();

  // Vendedor não tem assunto de configuração da empresa: cai no perfil.
  redirect(settingsHomeHref(payload?.role));
};

export default Page;
