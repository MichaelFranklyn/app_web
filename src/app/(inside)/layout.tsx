import { UserData } from "@/app/(auth)/login/interface";
import { AppProviders } from "@/components/AppProviders";
import { PlanProvider } from "@/services/plan";
import type { Metadata } from "next";
import { getCompanySetupPending } from "@/services/companySetup/server";
import { getPlanContract } from "@/services/plan/server";
import { isAdminRole } from "@/utils/auth/roles";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import InsideShell from "./content";
import { SIDEBAR_COLLAPSED_COOKIE } from "./navConfig";

/**
 * Carrega o que a empresa contratou ANTES de a casca renderizar.
 *
 * Aqui e não num fetch do cliente: a sidebar depende do plano para saber quais
 * destinos existem, e buscar depois faria os itens aparecerem (ou sumirem) meio
 * segundo após a tela abrir — na cara de quem já estava lendo o menu.
 *
 * O custo é uma consulta leve: `getPlanContract` não pede os tetos de uso, que
 * são o que faria o backend contar tabela por tabela.
 */
/**
 * Nada do sistema vai para a busca. O `robots.txt` já desencoraja o rastreio e
 * o `proxy.ts` devolve 307 para quem não tem sessão; este `noindex` é a rede
 * para o caso de uma URL interna vazar em um link e o buscador tentar mesmo
 * assim.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InsideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Os três em paralelo: o plano é uma ida ao backend, os cookies são locais, e
  // encadeá-los somaria latência ao tempo até a primeira pintura de TODA tela
  // de dentro — o layout roda antes de a página começar a renderizar.
  const userDataPromise = getServerCookie<UserData>("userData");
  const [plan, userData, collapsedPreference, setupPending] = await Promise.all(
    [
      getPlanContract(),
      userDataPromise,
      getServerCookie<boolean>(SIDEBAR_COLLAPSED_COOKIE),
      // Só o gestor configura a empresa: para o vendedor nem se pergunta, e a
      // casca dele não paga a ida ao backend.
      userDataPromise.then((user) =>
        isAdminRole(user?.role) ? getCompanySetupPending() : false
      ),
    ]
  );

  // Sem preferência salva, recolhida: é o padrão do produto (a tela inteira
  // para o conteúdo). Só a escolha explícita de expandir sobrevive.
  const initialCollapsed = collapsedPreference !== false;

  return (
    <AppProviders>
      <PlanProvider plan={plan}>
        <InsideShell
          userData={userData}
          initialCollapsed={initialCollapsed}
          setupPending={setupPending}
        >
          {children}
        </InsideShell>
      </PlanProvider>
    </AppProviders>
  );
}
