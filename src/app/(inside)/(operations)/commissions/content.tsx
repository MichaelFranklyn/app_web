"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { useUserData } from "@/hooks/useUserData";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { Coins } from "lucide-react";
import { useMemo, useState } from "react";
import { FactoryCommissionGroup } from "./_components/FactoryCommissionGroup";
import { COMMISSIONS_QUERY } from "./gql";
import { CommissionsResponse } from "./interface";
import { CommissionTab, COMMISSION_TABS, groupByFactory } from "./utils";

export default function CommissionsContent() {
  const { data, loading, error, refetch } = useQuery<CommissionsResponse>(
    COMMISSIONS_QUERY,
    { fetchPolicy: "cache-and-network" }
  );
  const [tab, setTab] = useState<CommissionTab>("receivable");

  // Vendedor só VISUALIZA quanto vai ganhar; conferir contra a planilha e marcar
  // repasse ("bater valores") é tarefa de gestão. userData chega após o mount:
  // até saber o papel, escondemos as ações (evita flash de botão que some).
  const { userData, isSeller } = useUserData();
  const canManage = userData ? !isSeller : false;

  const rows = useMemo(() => data?.commissions?.rows ?? [], [data]);
  const summary = data?.commissions;

  const filteredRows = useMemo(() => {
    if (tab === "all") return rows;
    return rows.filter((row) => row.status === tab);
  }, [rows, tab]);

  // Agrupado por fábrica trabalhada — é assim que a fábrica manda a planilha.
  // Cada card recorta o próprio mês (a planilha de repasse é mensal).
  const groups = useMemo(() => groupByFactory(filteredRows), [filteredRows]);

  const handleChanged = () => refetch();

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>Comissões</PanelHeader.Eyebrow>
            <PanelHeader.Title>Comissões</PanelHeader.Title>
            <PanelHeader.Description>
              {canManage
                ? "O que você tem para receber das fábricas. Cada fábrica tem o seu mês para você conferir contra a planilha que ela envia."
                : "Quanto você tem para ganhar de comissão, por fábrica e por mês."}
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {error && !summary ? (
        <QueryError onRetry={() => refetch()} />
      ) : (
        <>
          <Grid.Root cols={{ base: 1, tablet: 3 }} gap={20}>
            {summary ? (
              <>
                <Grid.Item>
                  <Card.Kpi>
                    <Card.Kpi.Label>A receber (total)</Card.Kpi.Label>
                    <Card.Kpi.Value status="atencao">
                      {formatMoney(Number(summary.totalReceivable))}
                    </Card.Kpi.Value>
                    <Card.Kpi.Delta>
                      {summary.countReceivable} parcela(s) a receber
                    </Card.Kpi.Delta>
                  </Card.Kpi>
                </Grid.Item>
                <Grid.Item>
                  <Card.Kpi>
                    <Card.Kpi.Label>Previsto (total)</Card.Kpi.Label>
                    <Card.Kpi.Value>
                      {formatMoney(Number(summary.totalPending))}
                    </Card.Kpi.Value>
                    <Card.Kpi.Delta>
                      Depende de faturamento/pagamento
                    </Card.Kpi.Delta>
                  </Card.Kpi>
                </Grid.Item>
                <Grid.Item>
                  <Card.Kpi>
                    <Card.Kpi.Label>Recebido (total)</Card.Kpi.Label>
                    <Card.Kpi.Value status="ok">
                      {formatMoney(Number(summary.totalReceived))}
                    </Card.Kpi.Value>
                    <Card.Kpi.Delta>Já repassado pelas fábricas</Card.Kpi.Delta>
                  </Card.Kpi>
                </Grid.Item>
              </>
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <Grid.Item key={i}>
                  <Card.Kpi>
                    <Loading.Skeleton className="h-[12px] w-24" />
                    <Loading.Skeleton className="mt-8 h-[28px] w-32" />
                    <Loading.Skeleton className="mt-8 h-[10px] w-28" />
                  </Card.Kpi>
                </Grid.Item>
              ))
            )}
          </Grid.Root>

          {/* Filtro por situação. Abaixo, um cartão por fábrica com o seu mês. */}
          <div className="flex flex-wrap items-center gap-4">
            {COMMISSION_TABS.map((item) => (
              <Button.Root
                key={item.id}
                appearance={tab === item.id ? "solid" : "ghost"}
                color={tab === item.id ? "amber" : "neutral"}
                size="sm"
                noUppercase
                onClick={() => setTab(item.id)}
              >
                <Button.Title>{item.label}</Button.Title>
              </Button.Root>
            ))}
          </div>

          {loading && !data?.commissions ? (
            <Table.Root>
              <Table.Table>
                <Table.Body>
                  <Table.Skeleton columns={8} rows={6} />
                </Table.Body>
              </Table.Table>
            </Table.Root>
          ) : groups.length === 0 ? (
            <Table.Root>
              <div className="p-24">
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Coins size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhuma comissão aqui</EmptyState.Title>
                  <EmptyState.Description>
                    As comissões aparecem quando os pedidos são faturados.
                    Fature um pedido para gerar as parcelas e acompanhar o que
                    há a receber.
                  </EmptyState.Description>
                </EmptyState.Root>
              </div>
            </Table.Root>
          ) : (
            <div className="flex flex-col gap-16">
              {groups.map((group, i) => (
                <FactoryCommissionGroup
                  key={group.factoryId}
                  group={group}
                  defaultOpen={i === 0}
                  canManage={canManage}
                  onChanged={handleChanged}
                />
              ))}
            </div>
          )}
        </>
      )}
    </PageContent>
  );
}
