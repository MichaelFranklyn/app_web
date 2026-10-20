import { requireFeaturePage } from "@/services/plan/server";
import { getDecodedTokenServer } from "@/utils/auth/jwt";
import { isAgendaManagerRole } from "@/utils/auth/roles";
import RoutinesContent from "./content";

const Page = async () => {
  // Sem o motor de rotina no plano, a tela abriria e cada query voltaria
  // "recurso não incluído" — erro em cima de erro no lugar de um redirect.
  await requireFeaturePage("ROUTINES");
  // O papel decide a PRIMEIRA query (a agenda de quem). Lido no cliente, ele
  // chegava um render atrasado: o gestor disparava antes a agenda de um
  // vendedor qualquer, sem filtro de pessoa, e a jogava fora.
  const payload = await getDecodedTokenServer();
  return (
    <RoutinesContent canSelectPerson={isAgendaManagerRole(payload?.role)} />
  );
};

export default Page;
