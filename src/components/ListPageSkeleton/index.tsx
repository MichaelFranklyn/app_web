// `Tabs` vem de módulo "use client": a partir de um Server Component ele chega
// como referência opaca, e ler `.Root`/`.List` dá `undefined` ("Element type
// is invalid"). Como `loading.tsx` é server, este skeleton precisa ser client
// (guarda em `__tests__/clientCompound.guard.test.ts`).
"use client";

import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { TitleColor } from "@/components/Title/interface";
import { Tabs } from "@/components/Tabs";
import { cn } from "@/lib/utils";
import { PAGE_HEADING, PageHeadingKey } from "@/utils/modules";
import React from "react";

interface ListPageSkeletonProps {
  /**
   * Título da página. É texto fixo — aparece de imediato, sem esperar dados.
   * Aceita nó para levar o mesmo `<Emphasis>` do header real (o destaque muda
   * a quebra de linha do título).
   */
  title: React.ReactNode;
  /** Eyebrow acima do título, quando o header real tem (texto e cor). */
  eyebrow?: { label: string; color?: TitleColor };
  /** O header real tem o "?" de ajuda ao lado do título (ocupa a linha). */
  help?: boolean;
  /**
   * Ícone do header real (`PAGE_HEADING`). Vai a CHAVE, não o ícone: o
   * `loading.tsx` é server e não passa componente para este client.
   */
  page?: PageHeadingKey;
  /** Descrição fixa da página; ausente (quando depende de dados) vira barra. */
  description?: string;
  /**
   * Faixa de ações do cabeçalho: nº de botões (largura padrão) ou a lista de
   * larguras, quando algum deles é largo (um campo de busca, por exemplo).
   */
  actions?: number | string[];
  /**
   * Faixa de KPIs acima da lista. Ausente = a página não tem KPIs. `help`: os
   * cartões reais têm o "?" ao lado do rótulo (ele deixa a linha mais alta).
   * `delta: false`: os cartões reais não têm a legenda embaixo do número (só
   * rótulo + valor, como os contadores de /support). Colunas e espaçamento vêm
   * do `Card.Kpi.Group`, como na página real.
   */
  kpis?: {
    count: number;
    help?: boolean;
    delta?: boolean;
  };
  /** Rótulos das abas, quando a lista tem abas (a 1ª entra como ativa). */
  tabs?: string[];
  /**
   * Título do card da lista (fixo na página real). `false`: o card real não
   * tem título — o cabeçalho é só busca e filtros.
   */
  listTitle?: string | false;
  /** Larguras dos controles do cabeçalho da lista (busca, "Filtros"…). */
  listActions?: string[];
  /** Rótulos das colunas — o cabeçalho da tabela também não depende de dados. */
  columns?: string[];
  rows?: number;
  /**
   * A tabela real usa `<Table.Table cards>`: abaixo do desktop cada linha vira
   * um cartão. Sem isto o celular via o cabeçalho de colunas e as faixas de
   * desktop enquanto carregava, e a página chegava com outra cara (/support,
   * 20/11/2026).
   */
  cards?: boolean;
  /**
   * Com `cards`: a tabela real tem colunas ordenáveis, e no celular elas viram
   * a faixa "Ordenar por:" com chips acima dos cartões.
   */
  sortable?: boolean;
  /** Corpo no lugar da tabela (ex.: grid de cards, painel de KPIs próprio). */
  children?: React.ReactNode;
}

/** Texto-modelo transparente sob o shimmer: ocupa a altura da linha real. */
function TextSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <Loading.Skeleton className="w-fit max-w-full text-transparent">
      {children}
    </Loading.Skeleton>
  );
}

/**
 * As linhas-cartão do celular (ver `Table/Primitive/cards.ts`): título com o
 * valor/situação à direita e duas linhas de detalhe — a mesma grade do cartão
 * real, com o mesmo respiro (px-16 py-12) e o mesmo divisor.
 */
function CardRowsSkeleton({
  rows,
  sortable,
}: {
  rows: number;
  sortable: boolean;
}) {
  return (
    <div className="desktop:hidden" aria-hidden>
      {sortable && (
        // A faixa real: py-12, chips de 44px no toque, "Ordenar por:" na frente.
        <div className="flex items-center gap-8 overflow-hidden border-b border-(--border) bg-(--bg2) px-16 py-12">
          <Title variant="body-sm" color="muted" className="shrink-0">
            Ordenar por:
          </Title>
          {["w-[92px]", "w-[96px]", "w-[104px]"].map((width, i) => (
            <Loading.Skeleton
              key={i}
              className={cn(
                "h-32 shrink-0 rounded-full pointer-coarse:h-[44px]",
                width
              )}
            />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-6 border-b border-(--border) px-16 py-12 last:border-b-0"
        >
          <div className="flex items-center justify-between gap-12">
            <Loading.Skeleton text="heading-sm" className="w-3/5" />
            <Loading.Skeleton className="h-[20px] w-[72px] rounded-full" />
          </div>
          <Loading.Skeleton text="body-sm" className="w-2/5" />
          <Loading.Skeleton text="body-sm" className="w-1/2" />
        </div>
      ))}
    </div>
  );
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
  page,
  description,
  actions = [],
  kpis,
  tabs,
  listTitle,
  listActions = ["w-[220px]"],
  eyebrow,
  help = false,
  columns,
  rows = 5,
  cards = false,
  sortable = false,
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
          ) : listTitle === false ? null : (
            <Loading.Skeleton text="body" className="w-40" />
          )}
          <Table.CardHead.Actions>
            {/* Num <div> próprio: as ações forçam `w-auto` nos filhos <div>
                diretos, e a barra solta ficava com 0px — no celular o
                cabeçalho da lista aparecia sem a busca. */}
            <div>
              {listActions.map((width, i) => (
                <Loading.Skeleton
                  key={i}
                  className={cn("h-[32px] shrink-0", width)}
                />
              ))}
            </div>
          </Table.CardHead.Actions>
        </Table.CardHead>

        {/* O className da Table vai no <table>, não no wrapper: quem some no
            celular é o wrapper inteiro. */}
        <div className={cards ? "max-desktop:hidden" : "contents"}>
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
        </div>

        {cards && <CardRowsSkeleton rows={rows} sortable={sortable} />}

        <Table.Footer>
          <Table.Footer.Info>
            <Loading.Skeleton text="body-sm" className="w-40" />
          </Table.Footer.Info>
        </Table.Footer>
      </Table.Root>
    ));

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            {eyebrow && (
              <PanelHeader.Eyebrow color={eyebrow.color}>
                {eyebrow.label}
              </PanelHeader.Eyebrow>
            )}
            <div className="flex items-center gap-6">
              {page ? (
                <PanelHeader.Heading {...PAGE_HEADING[page]}>
                  {title}
                </PanelHeader.Heading>
              ) : (
                <PanelHeader.Title>{title}</PanelHeader.Title>
              )}
              {help && (
                <Loading.Skeleton className="size-[32.8px] shrink-0 rounded-full" />
              )}
            </div>
            {description ? (
              <PanelHeader.Description>{description}</PanelHeader.Description>
            ) : (
              <Loading.Skeleton text="body-sm" className="mt-6 w-64" />
            )}
            {actionWidths.length > 0 && (
              <PanelHeader.Actions>
                {actionWidths.map((width, i) => (
                  <Loading.Skeleton key={i} className={cn("h-[32px]", width)} />
                ))}
              </PanelHeader.Actions>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {/* Os slots reais com um texto-modelo invisível sob o shimmer: cada
          linha fica com a altura tipográfica de verdade. Barras soltas davam
          128px contra 156px+ do cartão e a lista descia quando a página
          chegava (/orders, 17/11/2026). */}
      {kpis && (
        <Card.Kpi.Group>
          {Array.from({ length: kpis.count }).map((_, i) => (
            <Card.Kpi key={i} aria-hidden>
              <Card.Kpi.Label>
                <TextSkeleton>Rótulo do cartão</TextSkeleton>
                {kpis.help && (
                  <Loading.Skeleton className="size-[32.8px] shrink-0" />
                )}
              </Card.Kpi.Label>
              <Card.Kpi.Value>
                <TextSkeleton>R$ 0.000,00</TextSkeleton>
              </Card.Kpi.Value>
              {kpis.delta !== false && (
                <Card.Kpi.Delta>
                  <TextSkeleton>legenda do cartão</TextSkeleton>
                </Card.Kpi.Delta>
              )}
            </Card.Kpi>
          ))}
        </Card.Kpi.Group>
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
