"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";

// Dados pessoais, acesso ao sistema, dados de campo e senha — os quatro cards
// que as duas visões do perfil mostram.
const CARD_COUNT = 4;
// Os cards reais têm duas fileiras de campos (dados pessoais: contato +
// endereço; acesso: e-mail, situação, empresa, cadastro) — duas aproximam a
// altura definitiva melhor que uma.
const FIELD_ROWS = 2;
const FIELDS_PER_ROW = 3;

/** Placeholder de um campo: rótulo em cima, valor embaixo (igual ao DataField). */
function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-[6px]">
      <Loading.Skeleton className="h-[9px] w-16" />
      <Loading.Skeleton className="h-[13px] w-28" />
    </div>
  );
}

/** Placeholder de um card de dados: título, descrição e as fileiras de campos. */
function DataCardSkeleton() {
  return (
    <Card.Root className="h-full">
      <Card.Header>
        <Loading.Skeleton className="h-[14px] w-32" />
        <Loading.Skeleton className="mt-[6px] h-[10px] w-56" />
        <Card.Header.Actions>
          <Loading.Skeleton className="h-[28px] w-[28px]" />
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body className="flex flex-col gap-16">
        {Array.from({ length: FIELD_ROWS }).map((_, row) => (
          <Grid.Root key={row} cols={{ base: 1, desktop: 3 }} gap={16}>
            {Array.from({ length: FIELDS_PER_ROW }).map((_, i) => (
              <Grid.Item key={i}>
                <FieldSkeleton />
              </Grid.Item>
            ))}
          </Grid.Root>
        ))}
      </Card.Body>
    </Card.Root>
  );
}

/**
 * Placeholder do perfil de uma pessoa — vale para as duas visões: o próprio
 * perfil (`/settings/user/[id]`) e o de outra pessoa, na visão do gestor
 * (`/settings/users/[id]`).
 *
 * Espelha o que está sempre na tela: cabeçalho com avatar, nome, e-mail e
 * situação, e a grade dos quatro cards de cadastro. Os blocos de rotina,
 * fábricas e carteira ficam de fora porque só existem para quem vende em campo —
 * e isso só se sabe depois de a resposta chegar.
 */
export function UserProfileSkeleton({
  /** Visão do gestor: ela tem o rastro "Pessoas › nome" acima do cabeçalho. */
  hasBreadcrumb = false,
}: {
  hasBreadcrumb?: boolean;
}) {
  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        {hasBreadcrumb && (
          <div className="flex items-center gap-[8px]">
            <Loading.Skeleton className="h-[12px] w-16" />
            <Loading.Skeleton className="h-[12px] w-24" />
          </div>
        )}

        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <div className="flex items-center gap-12">
                <Loading.Skeleton className="h-[48px] w-[48px] rounded-full" />
                <div className="flex flex-col gap-[6px]">
                  <Loading.Skeleton className="h-[24px] w-56" />
                  <Loading.Skeleton className="h-[12px] w-72" />
                </div>
              </div>

              <PanelHeader.Actions className="mt-12">
                <Loading.Skeleton className="h-[24px] w-[88px] rounded-(--r-sm)" />
                <Loading.Skeleton className="h-[24px] w-[64px] rounded-(--r-sm)" />
              </PanelHeader.Actions>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      <Grid.Root
        cols={{ base: 1, desktop: 2 }}
        gap={16}
        className="items-start"
      >
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <Grid.Item key={i}>
            <DataCardSkeleton />
          </Grid.Item>
        ))}
      </Grid.Root>
    </PageContent>
  );
}
