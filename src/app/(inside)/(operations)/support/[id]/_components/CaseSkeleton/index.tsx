// `Card.Body` e `PanelHeader.*` são lidos como propriedade de módulos client:
// vindo do `loading.tsx` (server) eles chegariam opacos. Por isso é client.
"use client";

import { Card } from "@/components/Card";
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
        <div className="flex h-[25px] items-center gap-[8px]">
          <Loading.Skeleton className="h-[12px] w-20" />
          <Loading.Skeleton className="h-[12px] w-32" />
        </div>
        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.HeadingSkeleton {...PAGE_HEADING.support} />
              <div className="mt-[2px] flex h-[21px] items-center">
                <Loading.Skeleton className="h-[12px] w-96 max-w-full" />
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

      <Card.Root>
        <Card.Body padding="compact">
          <div className="flex flex-col">
            {SUMMARY_LABELS.map((label) => (
              <Card.Item key={label} variant="stat" className="flex-nowrap">
                <Card.Item.Label className="shrink-0">{label}</Card.Item.Label>
                <Card.Item.Actions className="flex-1 justify-end">
                  <Loading.Skeleton className="h-[12px] w-32" />
                </Card.Item.Actions>
              </Card.Item>
            ))}
          </div>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Body padding="compact" className="gap-12">
          <Loading.Skeleton className="h-[14px] w-40" />
          <Loading.Skeleton className="h-[72px] w-full" />
          <Loading.Skeleton className="h-[32px] w-[120px] self-end" />
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Body padding="compact" className="gap-16">
          <Loading.Skeleton className="h-[14px] w-32" />
          {Array.from({ length: TIMELINE_ENTRIES }).map((_, i) => (
            <div key={i} className="flex flex-col gap-[6px]">
              <Loading.Skeleton className="h-[10px] w-28" />
              <Loading.Skeleton className="h-[12px] w-full" />
            </div>
          ))}
        </Card.Body>
      </Card.Root>
    </PageContent>
  );
}
