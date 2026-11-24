// `Card.Body` e `PanelHeader.*` são lidos como propriedade de módulos client:
// vindo do `loading.tsx` (server) eles chegariam opacos. Por isso é client.
"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

/**
 * Rótulos do `CaseSummary` que estão sempre lá (o "Pedido" só aparece quando há
 * um, então fica de fora). São texto fixo: entram de verdade, só o valor é barra.
 */
const SUMMARY_LABELS = [
  "Cliente",
  "Vendedor",
  "Fábrica",
  "Tipo de problema",
  "Urgência",
  "Cliente avisou em",
  "Tempo",
  "Valor envolvido",
  "Registrado por",
];
const TIMELINE_ENTRIES = 3;

/**
 * Placeholder do detalhe da reclamação — serve ao `loading.tsx` (navegação)
 * e ao carregamento da query no `content.tsx`, para as duas esperas terem a
 * mesma forma. Antes a rota herdava o skeleton da LISTA de /support e, já no
 * cliente, virava dois retângulos soltos (14/11/2026).
 *
 * Espelha a tela pronta: caminho colado ao título (gap-8), ícone real do
 * módulo, e os três cards — resumo, novo andamento e histórico.
 */
export function CaseSkeleton() {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        {/* Alturas das linhas reais (caminho 25px, descrição 21px + 2px): a
            troca pelo conteúdo não empurra o que vem embaixo. */}
        <div className="flex h-[25px] items-center gap-8">
          <Loading.Skeleton text="body-sm" className="w-20" />
          <Loading.Skeleton text="body-sm" className="w-32" />
        </div>
        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.HeadingSkeleton {...PAGE_HEADING.support} />
              <div className="mt-2 flex h-[21px] items-center">
                <Loading.Skeleton text="body-sm" className="w-96 max-w-full" />
              </div>
              <PanelHeader.Actions>
                <Loading.Skeleton className="h-[24px] w-[88px]" />
                <Loading.Skeleton className="h-[32px] w-[132px]" />
                <Loading.Skeleton className="h-[32px] w-[96px]" />
              </PanelHeader.Actions>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      {/* Mesma forma dos cards prontos: cabeçalho com o título real e a
          ficha em duas colunas, rótulo em cima (padrão de 24/11/2026). */}
      <Card.Root>
        <Card.Header>
          <Card.Header.Title>Resumo</Card.Header.Title>
        </Card.Header>
        <Card.Body>
          <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
            {SUMMARY_LABELS.map((label) => (
              <Card.Field key={label} label={label}>
                <Loading.Skeleton
                  text="body-md"
                  className="w-[160px] max-w-full"
                />
              </Card.Field>
            ))}
          </Grid.Root>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Header.Title>Registrar andamento</Card.Header.Title>
        </Card.Header>
        <Card.Body>
          <Loading.Skeleton className="h-[72px] w-full" />
          <Loading.Skeleton className="h-[32px] w-[120px] self-end" />
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <Card.Header.Title>O que já foi feito</Card.Header.Title>
        </Card.Header>
        <Card.Body>
          {Array.from({ length: TIMELINE_ENTRIES }).map((_, i) => (
            <div key={i} className="flex flex-col gap-6">
              <Loading.Skeleton text="body-sm" className="w-28" />
              <Loading.Skeleton text="body-sm" className="w-full" />
            </div>
          ))}
        </Card.Body>
      </Card.Root>
    </PageContent>
  );
}
