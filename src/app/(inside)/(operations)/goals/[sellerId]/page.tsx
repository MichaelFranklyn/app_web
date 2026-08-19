import { UserData } from "@/app/(auth)/login/interface";
import { requireFeaturePage } from "@/services/plan/server";
import { getServerCookie } from "@/utils/cookies/serverCookie";

import SellerGoalsContent from "./content";

// Quem define metas e enxerga a de qualquer vendedor. O vendedor abre a mesma
// tela, só que acompanhando a própria — sem botões de edição.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

interface Props {
  params: Promise<{ sellerId: string }>;
  /** `month` (ISO do 1º dia) vem da lista: o mês aberto atravessa a navegação. */
  searchParams: Promise<{ month?: string }>;
}

export default async function Page({ params, searchParams }: Props) {
  await requireFeaturePage("GOALS");
  const { sellerId } = await params;
  const { month } = await searchParams;

  // Papel resolvido no servidor (mesmo cookie `userData` do login): evita o
  // salto de hidratação em que os botões de gestor piscam para o vendedor.
  const userData = await getServerCookie<UserData>("userData");
  const canManage = MANAGER_ROLES.includes(userData?.role ?? "");

  return (
    <SellerGoalsContent
      sellerId={sellerId}
      monthParam={month ?? null}
      canManage={canManage}
    />
  );
}
