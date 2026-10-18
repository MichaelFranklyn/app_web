import { requireFeaturePage } from "@/services/plan/server";
import RoutinesContent from "./content";

const Page = async () => {
  // Sem o motor de rotina no plano, a tela abriria e cada query voltaria
  // "recurso não incluído" — erro em cima de erro no lugar de um redirect.
  await requireFeaturePage("ROUTINES");
  return <RoutinesContent />;
};

export default Page;
