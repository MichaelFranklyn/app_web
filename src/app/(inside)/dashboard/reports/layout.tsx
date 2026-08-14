import { Breadcrumb } from "@/components/Breadcrumb";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { requireFeaturePage } from "@/services/plan/server";
import React, { Suspense } from "react";

import { ReportTabsNav } from "./_components/ReportTabsNav";

// As abas leem o querystring (o recorte viaja entre elas) e cada relatório é
// client-heavy — nada aqui é prerenderizável.
export const dynamic = "force-dynamic";

/**
 * Moldura das abas de relatório: o cabeçalho, a navegação e o lugar do
 * relatório escolhido.
 *
 * O período e o vendedor NÃO ficam aqui de propósito: eles moram na URL (ver
 * `useReportFilters`) e são desenhados por cada aba junto do "Exportar", porque
 * é a aba que sabe montar o próprio arquivo.
 */
export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No layout, e não em cada aba: são nove páginas, e uma esquecida seria uma
  // porta aberta. O fetch do plano é o mesmo do layout de `(inside)` — o
  // `cache` do React resolve os dois com uma consulta só.
  await requireFeaturePage("REPORTS");

  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item active>Relatórios</Breadcrumb.Item>
        </Breadcrumb.Root>

        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Title>Relatórios</PanelHeader.Title>
              <PanelHeader.Description>
                Os papéis da operação: escolha o período, confira os números e
                baixe em planilha ou PDF.
              </PanelHeader.Description>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      <div className="flex flex-col gap-12">
        {/* useSearchParams exige limite de Suspense para o Next não recusar a
            renderização estática da moldura. */}
        <Suspense fallback={null}>
          <ReportTabsNav />
        </Suspense>
        {children}
      </div>
    </PageContent>
  );
}
