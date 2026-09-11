// `Card`, `PanelHeader` e `Breadcrumb` vêm de módulos "use client": a partir de
// um Server Component eles chegam como referência opaca, e ler `.Kpi`/`.Title`
// deles dá `undefined`. Como `loading.tsx` é server, este skeleton é client.
"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";

import { AnalyticsStoryIndex } from "../AnalyticsStoryIndex";

/**
 * Esqueleto da tela de Desempenho, para o `loading.tsx` ao lado.
 *
 * A página é um Server Component que espera o guard de plano antes de devolver
 * qualquer coisa; sem este limite de Suspense o navegador fica com a área de
 * conteúdo em branco nesse intervalo — e é justamente o que o Speed Insights
 * mede como carregamento nesta rota, a de pior nota das três.
 *
 * O que é FIXO na tela aparece de verdade: a trilha, o título e o roteiro das
 * sete perguntas. Assim a troca pelo conteúdo real não empurra nada para baixo
 * — um esqueleto sem a trilha, por exemplo, faria a página inteira descer
 * 24px no instante em que os dados chegassem.
 */
export function AnalyticsSkeleton() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/dashboard">Dashboard</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item active>Desempenho</Breadcrumb.Item>
        </Breadcrumb.Root>

        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Title>Desempenho</PanelHeader.Title>
              {/* A descrição traz o período escolhido — vem com os dados. */}
              <Loading.Skeleton className="mt-[6px] h-[12px] w-64" />
              <PanelHeader.Actions className="mt-6">
                {/* Vendedor, fábrica, período e "Baixar PDF": as mesmas
                    larguras da barra real. */}
                <Loading.Skeleton className="h-[32px] w-[220px]" />
                <Loading.Skeleton className="h-[32px] w-[220px]" />
                <Loading.Skeleton className="h-[32px] w-[180px]" />
                <Loading.Skeleton className="h-[32px] w-[120px]" />
              </PanelHeader.Actions>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      {/* Mesmas colunas e mesmo gap do `AnalyticsSummary`. */}
      <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid.Item key={i}>
            <Loading.Skeleton className="h-[104px] w-full" />
          </Grid.Item>
        ))}
      </Grid.Root>

      {/* Conteúdo fixo: não depende de nenhuma query, então entra inteiro. */}
      <AnalyticsStoryIndex />

      {/* A primeira parte da história ("O resultado do período"): só ela, e não
          as sete. O resto está abaixo da dobra e só monta ao rolar (ver
          `LazyChartCard`) — desenhar trinta cartões cinzas aqui custaria
          renderização para pintar o que ninguém está olhando. */}
      <Card.Root>
        <Card.Header>
          <Loading.Skeleton className="h-[14px] w-48" />
        </Card.Header>
        <Card.Body>
          <Loading.Skeleton className="h-[300px] w-full" />
        </Card.Body>
      </Card.Root>
    </PageContent>
  );
}
