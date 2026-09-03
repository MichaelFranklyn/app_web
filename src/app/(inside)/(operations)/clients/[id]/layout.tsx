"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { FeatureGate } from "@/components/FeatureGate";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { Tabs } from "@/components/Tabs";
import { useOptimisticObject } from "@/hooks/useOptimisticObject";
import { useUserData } from "@/hooks/useUserData";
import { isAdminRole } from "@/utils/auth/roles";
import { useQuery } from "@apollo/client/react";
import { UserX } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { ClientDetailSkeleton } from "./_components/ClientDetailSkeleton";
import { DeleteClientModal } from "./_components/DeleteClientModal";
import { EditClientModal } from "./_components/EditClientModal";
import { OrderSheetButton } from "../../_components/OrderSheetButton";
import { ScoreTag } from "./_components/ScoreTag";
import { SharePortalModal } from "./_components/SharePortalModal";
import { ClientRouteProvider } from "./context";
import { COMPANY_CLIENT_QUERY } from "./gql";
import { ClientDetail, CompanyClientDetailQueryResponse } from "./interface";
import { formatCnpj } from "./utils";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const companyClientId = params.id as string;
  const { userData } = useUserData();

  const { data, loading, error, refetch } =
    useQuery<CompanyClientDetailQueryResponse>(COMPANY_CLIENT_QUERY, {
      variables: { id: companyClientId },
      skip: !companyClientId,
    });

  // A rota é chaveada pelo id da carteira; reconstruímos o ClientDetail (cliente
  // global + vínculo aninhado) para manter o header e os modais inalterados.
  const cc = data?.companyClient?.data;
  // Memoizado porque é a ficha que desce pelo contexto: remontá-lo a cada
  // render daria um objeto novo a cada vez, e toda a aba aberta re-renderizaria
  // sem nada ter mudado.
  const clientData: ClientDetail | undefined = useMemo(
    () =>
      cc && cc.client
        ? {
            ...cc.client,
            companyClient: {
              id: cc.id,
              notes: cc.notes,
              isActive: cc.isActive,
              networkId: cc.networkId,
              segmentId: cc.segmentId,
              network: cc.network,
              segment: cc.segment,
            },
          }
        : undefined,
    [cc]
  );

  const optimisticClient = useOptimisticObject<ClientDetail>({
    initialData: clientData ?? ({} as ClientDetail),
  });
  const companyClientView = clientData
    ? optimisticClient.data.companyClient
    : undefined;

  // Memoizado porque agora ele carrega a ficha inteira: um objeto novo a cada
  // render do layout re-renderizaria TODA a aba aberta sem nada ter mudado.
  const routeValue = useMemo(
    () =>
      clientData
        ? {
            companyClientId,
            clientId: clientData.id,
            client: optimisticClient.data,
            updateOptimistic: optimisticClient.updateOptimistic,
            commit: optimisticClient.commit,
            rollback: optimisticClient.rollback,
            refetch: () => {
              void refetch();
            },
          }
        : null,
    [
      clientData,
      companyClientId,
      optimisticClient.data,
      optimisticClient.updateOptimistic,
      optimisticClient.commit,
      optimisticClient.rollback,
      refetch,
    ]
  );

  const basePath = `/clients/${companyClientId}`;

  const name = clientData?.razaoSocial ?? "";
  const nameHighlight =
    clientData?.nomeFantasia ?? name.split(" ").slice(1).join(" ");
  const cnae =
    clientData?.cnae && clientData?.cnaeDescription
      ? `${clientData.cnae} - ${clientData.cnaeDescription}`
      : (clientData?.cnae ?? "—");
  const city =
    [clientData?.addressCity, clientData?.addressState]
      .filter(Boolean)
      .join(", ") || "—";
  const cnpj = clientData ? formatCnpj(clientData.cnpj) : "—";

  const isHeaderLoading = loading && !clientData;

  // Falha de rede/GraphQL (ex.: schema do backend defasado): é diferente de "não
  // existe". Mostra estado de erro com "tentar novamente", não "não encontrado".
  if (error && !clientData) {
    return (
      <PageContent>
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/clients">Clientes</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item active>Erro</Breadcrumb.Item>
        </Breadcrumb.Root>
        <QueryError onRetry={() => refetch()} />
      </PageContent>
    );
  }

  // Carteira inexistente (link/aba antiga após exclusão ou re-seed): o backend
  // responde data=null. Sem isto, `clientData` ficava undefined e a tela travava
  // no skeleton para sempre. Mostra um estado de "não encontrado" com volta.
  if (!loading && !clientData) {
    return (
      <PageContent>
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/clients">Clientes</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item active>Não encontrado</Breadcrumb.Item>
        </Breadcrumb.Root>
        <EmptyState.Root>
          <EmptyState.Icon>
            <UserX size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Cliente não encontrado</EmptyState.Title>
          <EmptyState.Description>
            Este cliente pode ter sido removido ou o endereço está
            desatualizado.
          </EmptyState.Description>
          <EmptyState.Actions>
            <Button.Root
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              onClick={() => router.push("/clients")}
            >
              <Button.Title>Voltar para Clientes</Button.Title>
            </Button.Root>
          </EmptyState.Actions>
        </EmptyState.Root>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/clients">Clientes</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item active>
            {isHeaderLoading ? (
              <Loading.Skeleton className="inline-block h-[12px] w-32 align-middle" />
            ) : (
              name || "—"
            )}
          </Breadcrumb.Item>
        </Breadcrumb.Root>

        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              {isHeaderLoading ? (
                <>
                  <Loading.Skeleton className="h-[24px] w-72" />
                  <Loading.Skeleton className="mt-[6px] h-[14px] w-96" />
                  <PanelHeader.Actions className="mt-8">
                    <Loading.Skeleton className="h-[20px] w-[72px] rounded-(--r-xs)" />
                    <Loading.Skeleton className="h-[32px] w-[100px]" />
                    <Loading.Skeleton className="h-[32px] w-[110px]" />
                  </PanelHeader.Actions>
                </>
              ) : (
                <>
                  <PanelHeader.Title>
                    {nameHighlight ? (
                      <>
                        {name.replace(nameHighlight, "").trim()} {nameHighlight}
                      </>
                    ) : (
                      name || "—"
                    )}
                  </PanelHeader.Title>
                  <PanelHeader.Description>
                    {`${cnae} · ${city} · CNPJ ${cnpj}`}
                  </PanelHeader.Description>

                  <PanelHeader.Actions data-tour="client-detail-actions">
                    {companyClientView && (
                      <Badge.Root
                        color={companyClientView.isActive ? "green" : "neutral"}
                        appearance="tinted"
                        size="sm"
                      >
                        <Badge.Text>
                          {companyClientView.isActive ? "Ativo" : "Inativo"}
                        </Badge.Text>
                      </Badge.Root>
                    )}
                    <FeatureGate feature="ROUTINES">
                      <ScoreTag
                        score={cc?.topVisitScore ?? null}
                        factoryScores={cc?.factoryVisitScores ?? []}
                      />
                    </FeatureGate>
                    {clientData && (
                      <EditClientModal
                        client={clientData}
                        onUpdateOptimistic={optimisticClient.updateOptimistic}
                        onCommit={optimisticClient.commit}
                        onRollback={optimisticClient.rollback}
                      />
                    )}
                    {clientData && (
                      /* A ficha sai daqui com o cabeçalho deste cliente já
                         preenchido — é a tela de onde o vendedor sai para
                         visitá-lo. */
                      <OrderSheetButton
                        canSelectSeller={isAdminRole(userData?.role)}
                        cnpjDigits={clientData.cnpj.replace(/\D/g, "")}
                        clientName={
                          clientData.nomeFantasia ?? clientData.razaoSocial
                        }
                      />
                    )}
                    {clientData?.companyClient && (
                      <SharePortalModal
                        companyClientId={clientData.companyClient.id}
                        clientName={
                          clientData.nomeFantasia ?? clientData.razaoSocial
                        }
                      />
                    )}
                    {clientData?.companyClient && (
                      <DeleteClientModal
                        companyClientId={clientData.companyClient.id}
                        clientName={
                          clientData.nomeFantasia ?? clientData.razaoSocial
                        }
                      />
                    )}
                  </PanelHeader.Actions>
                </>
              )}
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      <div>
        <Tabs.NavList data-tour="client-tabs">
          <Tabs.NavItem href={`${basePath}/overview`}>Visão Geral</Tabs.NavItem>
          <Tabs.NavItem href={`${basePath}/factories`}>Fábricas</Tabs.NavItem>
          <Tabs.NavItem href={`${basePath}/orders`}>Pedidos</Tabs.NavItem>
          {/* Visita, estoque estimado e score são o motor de rotina: um
              recurso só, e um plano que não o tem não tem nenhum dos três. */}
          <FeatureGate feature="ROUTINES">
            <Tabs.NavItem href={`${basePath}/visits`}>Visitas</Tabs.NavItem>
            <Tabs.NavItem href={`${basePath}/stock`}>
              Estoque Estimado
            </Tabs.NavItem>
            <Tabs.NavItem href={`${basePath}/score`}>Score</Tabs.NavItem>
          </FeatureGate>
        </Tabs.NavList>

        {routeValue ? (
          // A ficha desce inteira, com o estado otimista junto: a aba Visão
          // Geral lia os mesmos campos por uma segunda query, que só saía
          // depois desta responder (ver `context.tsx`).
          <ClientRouteProvider value={routeValue}>
            {children}
          </ClientRouteProvider>
        ) : (
          <ClientDetailSkeleton />
        )}
      </div>
    </PageContent>
  );
}
