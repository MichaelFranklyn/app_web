"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { getTodayIso } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { CommissionsTable } from "./_components/CommissionsTable";
import { MarkReceivedModal } from "./_components/MarkReceivedModal";
import { COMMISSIONS_QUERY } from "./gql";
import { CommissionRow, CommissionsResponse } from "./interface";
import {
  addMonths,
  CommissionTab,
  COMMISSION_TABS,
  isInMonth,
  monthLabel,
  YearMonth,
  yearMonthFromIso,
} from "./utils";

// A data em que a comissão da linha cai no mês (recebida/a receber/prevista).
const rowMonthDate = (row: CommissionRow): string | null => row.receiveDate;

export default function CommissionsContent() {
  const { data, loading, refetch } = useQuery<CommissionsResponse>(
    COMMISSIONS_QUERY,
    { fetchPolicy: "cache-and-network" }
  );
  const [tab, setTab] = useState<CommissionTab>("receivable");
  const [month, setMonth] = useState<YearMonth>(() =>
    yearMonthFromIso(getTodayIso())
  );

  const rows = useMemo(() => data?.commissions?.rows ?? [], [data]);

  // Linhas do mês selecionado (pela data em que a comissão cai).
  const monthRows = useMemo(
    () => rows.filter((row) => isInMonth(rowMonthDate(row), month)),
    [rows, month]
  );

  const sumBy = (list: CommissionRow[], status: CommissionRow["status"]) =>
    list
      .filter((row) => row.status === status)
      .reduce((acc, row) => acc + Number(row.amount), 0);

  const monthReceivable = useMemo(
    () => sumBy(monthRows, "receivable"),
    [monthRows]
  );
  const monthReceived = useMemo(
    () => sumBy(monthRows, "received"),
    [monthRows]
  );
  const monthPending = useMemo(() => sumBy(monthRows, "pending"), [monthRows]);

  const filteredRows = useMemo(() => {
    if (tab === "all") return monthRows;
    return monthRows.filter((row) => row.status === tab);
  }, [monthRows, tab]);

  // Recebíveis do mês (para o "Receber tudo").
  const receivableIds = useMemo(
    () =>
      monthRows
        .filter((row) => row.status === "receivable")
        .map((row) => row.installmentId),
    [monthRows]
  );

  const handleChanged = () => refetch();
  const isCurrentMonth = useMemo(() => {
    const now = yearMonthFromIso(getTodayIso());
    return now.year === month.year && now.month === month.month;
  }, [month]);

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>Comissões</PanelHeader.Eyebrow>
            <PanelHeader.Title>Comissões</PanelHeader.Title>
            <PanelHeader.Description>
              O que você tem para receber das fábricas em {monthLabel(month)}.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {/* Navegação de mês */}
      <div className="flex items-center justify-center gap-12">
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          isIconOnly
          onClick={() => setMonth((m) => addMonths(m, -1))}
        >
          <Button.Icon icon={ChevronLeft} />
        </Button.Root>
        <Title
          variant="body"
          weight="bold"
          className="min-w-[180px] text-center"
        >
          {monthLabel(month)}
        </Title>
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          isIconOnly
          onClick={() => setMonth((m) => addMonths(m, 1))}
        >
          <Button.Icon icon={ChevronRight} />
        </Button.Root>
        {!isCurrentMonth && (
          <Button.Root
            appearance="ghost"
            color="amber"
            size="sm"
            noUppercase
            onClick={() => setMonth(yearMonthFromIso(getTodayIso()))}
          >
            <Button.Title>Voltar para o mês atual</Button.Title>
          </Button.Root>
        )}
      </div>

      <Grid.Root cols={{ base: 1, tablet: 3 }} gap={20}>
        {data?.commissions ? (
          <>
            <Grid.Item>
              <Card.Kpi>
                <Card.Kpi.Label>
                  A receber em {monthLabel(month)}
                </Card.Kpi.Label>
                <Card.Kpi.Value status="atencao">
                  {formatMoney(monthReceivable)}
                </Card.Kpi.Value>
                <Card.Kpi.Delta>
                  {receivableIds.length} parcela(s) confirmada(s)
                </Card.Kpi.Delta>
              </Card.Kpi>
            </Grid.Item>
            <Grid.Item>
              <Card.Kpi>
                <Card.Kpi.Label>Previsto no mês</Card.Kpi.Label>
                <Card.Kpi.Value>{formatMoney(monthPending)}</Card.Kpi.Value>
                <Card.Kpi.Delta>
                  Depende de faturamento/pagamento
                </Card.Kpi.Delta>
              </Card.Kpi>
            </Grid.Item>
            <Grid.Item>
              <Card.Kpi>
                <Card.Kpi.Label>Recebido no mês</Card.Kpi.Label>
                <Card.Kpi.Value status="ok">
                  {formatMoney(monthReceived)}
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

      <Table.Root>
        <Table.CardHead>
          <Table.CardHead.Title>
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
          </Table.CardHead.Title>
          {receivableIds.length > 0 && (
            <Table.CardHead.Actions>
              <MarkReceivedModal
                installmentIds={receivableIds}
                label={`Receber tudo (${receivableIds.length})`}
                onSuccess={handleChanged}
              />
            </Table.CardHead.Actions>
          )}
        </Table.CardHead>

        <CommissionsTable
          rows={filteredRows}
          loading={loading && !data?.commissions}
          onChanged={handleChanged}
        />
      </Table.Root>
    </PageContent>
  );
}
