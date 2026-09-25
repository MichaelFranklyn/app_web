"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { CLIENT_CACHE_FIELDS } from "@/utils/cacheFields";
import { useQuery } from "@apollo/client/react";
import { HygieneTable } from "./_components/HygieneTable";
import { ReceitaCheckCard } from "./_components/ReceitaCheckCard";
import { CLIENT_HYGIENE_QUERY } from "./gql";
import { ClientHygieneData } from "./interface";
import { HYGIENE_DESCRIPTION, HYGIENE_TITLE } from "./utils";

/**
 * A higienização da carteira: quem parece desatualizado, e por quê.
 *
 * Não é paginada — a lista é de SUSPEITOS (o backend corta em 200, do sinal
 * mais forte para o mais fraco), e cada ação tomada tira a linha dela.
 */
export default function HygieneContent() {
  const invalidateClient = useInvalidateQueriesClient();
  const { data, loading, error, refetch } = useQuery<ClientHygieneData>(
    CLIENT_HYGIENE_QUERY,
    { fetchPolicy: "cache-and-network" }
  );
  const hygiene = data?.clientHygiene;

  // Qualquer decisão muda a lista daqui e as listas de clientes do app.
  const handleChanged = () => {
    void refetch();
    void invalidateClient(CLIENT_CACHE_FIELDS);
  };

  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/clients">Clientes</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item active>{HYGIENE_TITLE}</Breadcrumb.Item>
        </Breadcrumb.Root>
        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Title>{HYGIENE_TITLE}</PanelHeader.Title>
              <PanelHeader.Description>
                {HYGIENE_DESCRIPTION}
              </PanelHeader.Description>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      {hygiene && (
        <ReceitaCheckCard
          pending={hygiene.receitaPending}
          onChecked={() => void refetch()}
        />
      )}

      <HygieneTable
        items={hygiene?.items ?? []}
        loading={loading}
        error={Boolean(error)}
        onRetry={() => void refetch()}
        onChanged={handleChanged}
      />
    </PageContent>
  );
}
