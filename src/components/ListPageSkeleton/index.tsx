// `Card.Header` (= `Table.CardHead`) e `Card.Kpi` vêm de módulos "use client":
// a partir de um Server Component eles chegam como referência opaca, e ler
// `.Title`/`.Actions` deles dá `undefined` ("Element type is invalid"). Como
// `loading.tsx` é server, este skeleton precisa ser client.
"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { GridBreakpointCols } from "@/components/Grid/Root/interface";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { cn } from "@/lib/utils";
import React from "react";

const DEFAULT_KPI_COLS: GridBreakpointCols = {
  base: 1,
  tablet: 2,
  "desktop-xl": 4,
};

interface ListPageSkeletonProps {
  /** Título da página. É texto fixo — aparece de imediato, sem esperar dados. */
  title: string;
  /** Descrição fixa da página; ausente (quando depende de dados) vira barra. */
  description?: string;
  /**
   * Faixa de ações do cabeçalho: nº de botões (largura padrão) ou a lista de
   * larguras, quando algum deles é largo (um campo de busca, por exemplo).
   */
  actions?: number | string[];
  /** Faixa de KPIs acima da lista. Ausente = a página não tem KPIs. */
  kpis?: { count: number; cols?: GridBreakpointCols };
  /** Rótulos das abas, quando a lista tem abas (a 1ª entra como ativa). */
  tabs?: string[];
  /** Título do card da lista (fixo na página real). */
  listTitle?: string;
  /** Rótulos das colunas — o cabeçalho da tabela também não depende de dados. */
  columns?: string[];
  rows?: number;
  /** Corpo no lugar da tabela (ex.: grid de cards, painel de KPIs próprio). */
  children?: React.ReactNode;
}

/**
 * Placeholder de página de listagem, para uso em `loading.tsx`.
 *
 * Serve o esqueleto da tela enquanto o servidor ainda monta a página: sem esse
 * limite de Suspense, nada é enviado ao navegador até as queries SSR voltarem —
 * é o que deixa a área de conteúdo em branco na entrada da rota.
 *
 * O que é fixo (título, descrição, rótulos de coluna) aparece de verdade; só o
 * que vem de dados fica cinza. Assim a troca pelo conteúdo real não desloca nada.
 */
export function ListPageSkeleton({
  title,
  description,
  actions = [],
  kpis,
  tabs,
  listTitle,
  columns,
  rows = 5,
  children,
}: ListPageSkeletonProps) {
  const actionWidths =
    typeof actions === "number"
      ? Array.from({ length: actions }, () => "w-[120px]")
      : actions;

  const body =
    children ??
    (columns && (
      <Table.Root>
        <Table.CardHead>
          {listTitle ? (
            <Table.CardHead.Title>{listTitle}</Table.CardHead.Title>
          ) : (
            <Loading.Skeleton className="h-[14px] w-40" />
          )}
          <Table.CardHead.Actions>
            <Loading.Skeleton className="h-[32px] w-[220px]" />
          </Table.CardHead.Actions>
        </Table.CardHead>

        <Table.Table>
          <Table.Header>
            <Table.Row>
              {columns.map((label, i) => (
                <Table.Head key={i}>{label}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Skeleton columns={columns.length} rows={rows} />
          </Table.Body>
        </Table.Table>

        <Table.Footer>
          <Table.Footer.Info>
            <Loading.Skeleton className="h-[12px] w-40" />
          </Table.Footer.Info>
        </Table.Footer>
      </Table.Root>
    ));

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>{title}</PanelHeader.Title>
            {description ? (
              <PanelHeader.Description>{description}</PanelHeader.Description>
            ) : (
              <Loading.Skeleton className="mt-[6px] h-[12px] w-64" />
            )}
            {actionWidths.length > 0 && (
              <PanelHeader.Actions className="mt-6">
                {actionWidths.map((width, i) => (
                  <Loading.Skeleton key={i} className={cn("h-[32px]", width)} />
                ))}
              </PanelHeader.Actions>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {kpis && (
        <Grid.Root cols={kpis.cols ?? DEFAULT_KPI_COLS} gap={20}>
          {Array.from({ length: kpis.count }).map((_, i) => (
            <Grid.Item key={i}>
              <Card.Kpi>
                <Loading.Skeleton className="h-[12px] w-24" />
                <Loading.Skeleton className="mt-8 h-[28px] w-32" />
                <Loading.Skeleton className="mt-8 h-[10px] w-28" />
              </Card.Kpi>
            </Grid.Item>
          ))}
        </Grid.Root>
      )}

      {tabs ? (
        // Abas reais com os rótulos reais: a barra já ocupa a altura definitiva,
        // então a troca pelo conteúdo não empurra a lista para baixo.
        <Tabs.Root defaultValue={tabs[0]}>
          <Tabs.List>
            {tabs.map((label) => (
              <Tabs.Item key={label} value={label}>
                {label}
              </Tabs.Item>
            ))}
          </Tabs.List>
          <Tabs.Content value={tabs[0]}>{body}</Tabs.Content>
        </Tabs.Root>
      ) : (
        body
      )}
    </PageContent>
  );
}
