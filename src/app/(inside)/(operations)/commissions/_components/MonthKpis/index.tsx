"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { formatMoney } from "@/utils/format/masks";

import {
  KPI_PENDING_HELP,
  KPI_RECEIVABLE_HELP,
  KPI_RECEIVED_HELP,
} from "../../help";
import { monthLabel, type MonthSummary, type YearMonth } from "../../utils";

interface Props {
  totals: MonthSummary;
  month: YearMonth;
  /** Gestor olhando a fatia do vendedor: os rótulos passam a falar de repasse. */
  isSellerView: boolean;
  isLoading: boolean;
}

/** Os três números do mês: a receber, previsto e recebido. */
export function MonthKpis({ totals, month, isSellerView, isLoading }: Props) {
  if (isLoading) {
    return (
      <Grid.Root
        cols={{ base: 1, tablet: 3 }}
        gap={20}
        data-tour="commissions-kpis"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid.Item key={i}>
            <Card.Kpi>
              <Loading.Skeleton className="h-[12px] w-24" />
              <Loading.Skeleton className="mt-8 h-[28px] w-32" />
              <Loading.Skeleton className="mt-8 h-[10px] w-28" />
            </Card.Kpi>
          </Grid.Item>
        ))}
      </Grid.Root>
    );
  }

  return (
    <Grid.Root
      cols={{ base: 1, tablet: 3 }}
      gap={20}
      data-tour="commissions-kpis"
    >
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label className="inline-flex items-center gap-2">
            {isSellerView ? "Repasse a receber em " : "A receber em "}
            {monthLabel(month)}
            <HelpTooltip
              label="Sobre o valor a receber no mês"
              content={KPI_RECEIVABLE_HELP}
            />
          </Card.Kpi.Label>
          <Card.Kpi.Value status="atencao">
            {formatMoney(totals.receivable)}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>
            {totals.chargeback < 0
              ? `${totals.countReceivable} parcela(s) · já descontado ${formatMoney(Math.abs(totals.chargeback))} de estorno`
              : `${totals.countReceivable} parcela(s) a receber`}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label className="inline-flex items-center gap-2">
            {isSellerView ? "Repasse previsto em " : "Previsto em "}
            {monthLabel(month)}
            <HelpTooltip
              label="Sobre o valor previsto no mês"
              content={KPI_PENDING_HELP}
            />
          </Card.Kpi.Label>
          <Card.Kpi.Value>{formatMoney(totals.pending)}</Card.Kpi.Value>
          <Card.Kpi.Delta>Depende de faturamento/pagamento</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label className="inline-flex items-center gap-2">
            {isSellerView ? "Repassado em " : "Recebido em "}
            {monthLabel(month)}
            <HelpTooltip
              label="Sobre o valor recebido no mês"
              content={KPI_RECEIVED_HELP}
            />
          </Card.Kpi.Label>
          <Card.Kpi.Value status="ok">
            {formatMoney(totals.received)}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>
            {isSellerView
              ? "Já pago pelo escritório ao vendedor"
              : "Já repassado pelas fábricas"}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>
    </Grid.Root>
  );
}
