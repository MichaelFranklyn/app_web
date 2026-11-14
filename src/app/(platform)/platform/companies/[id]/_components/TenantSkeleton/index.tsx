// `PanelHeader.*` e `Card.*` vêm de módulo client: a partir do `loading.tsx`
// (server) eles chegariam opacos, então este esqueleto é client.
"use client";

import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

// Plano, uso, pessoas, gráfico de atividade, atividade e auditoria — na ordem
// da página, com a altura aproximada de cada corpo.
const CARD_BODIES = ["h-[120px]", "h-[120px]", "h-[160px]", "h-[220px]"];

/**
 * A ficha da empresa enquanto o tenant carrega (14/11/2026). Espelha o
 * `TenantHeader`: o eyebrow "Empresa" e o ícone do módulo são fixos e já
 * aparecem de verdade; nome, CNPJ, selo de situação e botões viram barra.
 * Usado no `loading.tsx` e no early-return do `content.tsx`, para o esqueleto
 * não mudar de forma no meio do carregamento.
 */
export function TenantSkeleton() {
  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <div className="flex items-center justify-between gap-8">
              <PanelHeader.Eyebrow color="blue">Empresa</PanelHeader.Eyebrow>
              <Loading.Skeleton className="h-[20px] w-[72px]" />
            </div>
            <PanelHeader.HeadingSkeleton {...PAGE_HEADING.platformCompanies} />
            <div className="mt-[2px] flex h-[21px] items-center">
              <Loading.Skeleton className="h-[12px] w-80 max-w-full" />
            </div>
            <PanelHeader.Actions className="mt-12">
              <Loading.Skeleton className="h-[32px] w-[140px]" />
              <Loading.Skeleton className="h-[32px] w-[104px]" />
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {CARD_BODIES.map((height, i) => (
        <Card.Root key={i}>
          <Card.Header>
            <Loading.Skeleton className="h-[14px] w-40" />
          </Card.Header>
          <Card.Body>
            <Loading.Skeleton className={`${height} w-full`} />
          </Card.Body>
        </Card.Root>
      ))}
    </PageContent>
  );
}
