"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Tabs } from "@/components/Tabs";
import { useOptimisticObject } from "@/hooks/useOptimisticObject";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import React from "react";
import { DeleteClientModal } from "./_components/DeleteClientModal";
import { EditClientModal } from "./_components/EditClientModal";
import { CLIENT_QUERY } from "./gql";
import { ClientDetail, ClientDetailQueryResponse } from "./interface";
import { formatCnpj } from "./utils";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;

  const { data, loading } = useQuery<ClientDetailQueryResponse>(CLIENT_QUERY, {
    variables: { id },
    skip: !id,
  });

  const clientData = data?.client?.data;

  const optimisticClient = useOptimisticObject<ClientDetail>({
    initialData: clientData ?? ({} as ClientDetail),
  });
  const companyClientView = clientData
    ? optimisticClient.data.companyClient
    : undefined;

  const basePath = `/clients/${id}`;

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
              (name || "—")
            )}
          </Breadcrumb.Item>
        </Breadcrumb.Root>

        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Eyebrow>
                03 — Clientes
              </PanelHeader.Eyebrow>
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
                        {name.replace(nameHighlight, "").trim()}{" "}
                        {nameHighlight}
                      </>
                    ) : (
                      name || "—"
                    )}
                  </PanelHeader.Title>
                  <PanelHeader.Description>
                    {`${cnae} · ${city} · CNPJ ${cnpj}`}
                  </PanelHeader.Description>

                  <PanelHeader.Actions>
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
                    {clientData && (
                      <EditClientModal
                        client={clientData}
                        onUpdateOptimistic={optimisticClient.updateOptimistic}
                        onCommit={optimisticClient.commit}
                        onRollback={optimisticClient.rollback}
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
        <Tabs.NavList>
          <Tabs.NavItem href={`${basePath}/overview`}>Visão Geral</Tabs.NavItem>
          <Tabs.NavItem href={`${basePath}/factories`}>Fábricas</Tabs.NavItem>
          <Tabs.NavItem href={`${basePath}/orders`}>Pedidos</Tabs.NavItem>
          <Tabs.NavItem href={`${basePath}/visits`}>Visitas</Tabs.NavItem>
          <Tabs.NavItem href={`${basePath}/stock`}>
            Estoque Estimado
          </Tabs.NavItem>
          <Tabs.NavItem href={`${basePath}/score`}>Score</Tabs.NavItem>
        </Tabs.NavList>

        {children}
      </div>
    </PageContent>
  );
}
