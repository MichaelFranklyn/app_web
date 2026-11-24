import { UserData } from "@/app/(auth)/login/interface";
import { requireFeaturePage } from "@/services/plan/server";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import { redirect } from "next/navigation";
import GoalsContent from "./content";

// Quem define metas e enxerga a de qualquer vendedor. O vendedor abre a mesma
// tela, só que acompanhando a própria — sem seletor e sem botões de edição.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

export default async function Page() {
  await requireFeaturePage("GOALS");
  // Papel resolvido no servidor (mesmo cookie `userData` do login): evita o
  // salto de hidratação em que os botões de gestor piscam para o vendedor.
  const userData = await getServerCookie<UserData>("userData");
  const canManage = MANAGER_ROLES.includes(userData?.role ?? "");

  // O vendedor só tem uma linha nesta lista — a dele. Abrir a tabela de uma
  // pessoa só e pedir um clique a mais para ver as fábricas era um passo à
  // toa (crítica de 23/11/2026): ele cai direto nos cartões das fábricas.
  if (!canManage && userData?.sellerId) {
    redirect(`/goals/${userData.sellerId}`);
  }

  // O gestor abre vendo a empresa inteira (e filtra por vendedor se quiser);
  // o vendedor não escolhe nada — o backend já o prende à própria meta.
  return <GoalsContent canManage={canManage} />;
}
