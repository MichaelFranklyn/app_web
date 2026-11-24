"use client";

import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { DataCardSkeleton } from "../../dataCards";

// Dados pessoais, acesso ao sistema, dados de campo e senha — os quatro cards
// que as duas visões do perfil mostram.
const CARD_COUNT = 4;
// Os cards reais têm duas fileiras de três campos (dados pessoais: contato +
// endereço; acesso: e-mail, situação, empresa, cadastro) — seis aproximam a
// altura definitiva melhor que três.
const FIELDS_PER_CARD = 6;

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
          <div className="flex items-center gap-8">
            <Loading.Skeleton text="body-sm" className="w-[64px]" />
            <Loading.Skeleton text="body-sm" className="w-[96px]" />
          </div>
        )}

        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <div className="flex items-center gap-12">
                <Loading.Skeleton
                  shape="pill"
                  className="h-[48px] w-[48px] shrink-0"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-6">
                  <Loading.Skeleton className="h-[24px] w-[224px] max-w-full" />
                  <Loading.Skeleton
                    text="body-sm"
                    className="w-[288px] max-w-full"
                  />
                </div>
              </div>

              <PanelHeader.Tags>
                <Loading.Skeleton className="h-[33px] w-[88px]" />
                <Loading.Skeleton className="h-[33px] w-[64px]" />
              </PanelHeader.Tags>
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
            <DataCardSkeleton fields={FIELDS_PER_CARD} desktopCols={3} />
          </Grid.Item>
        ))}
      </Grid.Root>
    </PageContent>
  );
}
