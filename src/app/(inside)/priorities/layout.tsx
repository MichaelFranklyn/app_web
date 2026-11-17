import { UserData } from "@/app/(auth)/login/interface";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { isAdminRole } from "@/utils/auth/roles";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import { PAGE_HEADING } from "@/utils/modules";
import React from "react";

import { CentralTabsNav } from "./_components/CentralTabsNav";
import { SellerScope } from "./_components/SellerScope";

/**
 * A central do dia: Pendências (o que você tem de resolver) e Oportunidades
 * (onde vale agir para vender mais), uma entrada na sidebar e uma aba para
 * cada (14/11/2026). As duas seguem telas independentes — cada aba tem a sua
 * consulta, o seu SSR-seed e o seu `loading.tsx`, que pinta só o miolo:
 * cabeçalho e abas ficam parados ao trocar de aba.
 *
 * O vendedor escolhido pelo gestor é da central, não de uma aba: o campo fica
 * no cabeçalho e as duas abas leem o mesmo `?seller=` (17/11/2026).
 */
export default async function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getServerCookie<UserData>("userData");
  // `sellers` é @is_admin: para o vendedor o campo nem existe — a leitura já
  // é a dele.
  const canSelectSeller = isAdminRole(userData?.role);

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Heading {...PAGE_HEADING.priorities}>
              Prioridades
            </PanelHeader.Heading>
            <PanelHeader.Description>
              O que espera por você e onde vale agir para vender mais, cada um
              na sua aba.
            </PanelHeader.Description>
            {canSelectSeller && (
              <PanelHeader.Actions className="mt-6">
                <SellerScope />
              </PanelHeader.Actions>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {/* Sem gap: o NavList já traz o respiro (mb-24) até o miolo da aba. */}
      <div className="flex flex-col">
        <CentralTabsNav />
        {children}
      </div>
    </PageContent>
  );
}
