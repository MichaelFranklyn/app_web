import { requireFeaturePage } from "@/services/plan/server";
import PlanWeekContent from "./content";

/**
 * "Montar semana" (/routines/plan) — o vendedor escolhe os clientes da semana
 * numa lista de prioritários por região, e o sistema monta o caminho de cada
 * dia (decisão de 18/10/2026: a agenda deixa de vir pronta).
 */
const Page = async () => {
  await requireFeaturePage("ROUTINES");
  return <PlanWeekContent />;
};

export default Page;
