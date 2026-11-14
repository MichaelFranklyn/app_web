import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import React from "react";

import { CentralTabsNav } from "./_components/CentralTabsNav";

/**
 * A central do dia: Pendências (o que você tem de resolver) e Oportunidades
 * (onde vale agir para vender mais), uma entrada na sidebar e uma aba para
 * cada (14/11/2026). As duas seguem telas independentes — cada aba tem a sua
 * consulta, o seu SSR-seed e o seu `loading.tsx`, que pinta só o miolo:
 * cabeçalho e abas ficam parados ao trocar de aba.
 */
export default function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
