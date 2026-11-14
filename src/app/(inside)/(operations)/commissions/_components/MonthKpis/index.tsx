"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { formatMoney } from "@/utils/format/masks";

import { monthLabel, type MonthSummary, type YearMonth } from "../../utils";

/** Linha inteira nas duas colunas do celular; uma coluna das 3 no tablet+. */
const THIRD_SPAN = { base: 2, tablet: 1 } as const;

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
        cols={{ base: 2, tablet: 3 }}
        gap={20}
        data-tour="commissions-kpis"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid.Item key={i} span={i === 2 ? THIRD_SPAN : undefined}>
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
      cols={{ base: 2, tablet: 3 }}
      gap={20}
      data-tour="commissions-kpis"
    >
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>
            {isSellerView ? "Repasse a receber em " : "A receber em "}
            {monthLabel(month)}
          </Card.Kpi.Label>
          <Card.Kpi.Value
            status={totals.receivable > 0 ? "atencao" : "neutral"}
          >
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
          <Card.Kpi.Label>
            {isSellerView ? "Repasse previsto em " : "Previsto em "}
            {monthLabel(month)}
          </Card.Kpi.Label>
          <Card.Kpi.Value>{formatMoney(totals.pending)}</Card.Kpi.Value>
          <Card.Kpi.Delta>Depende de faturamento ou pagamento</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>
      {/* Duas colunas no celular: o terceiro cartão ocupa a linha inteira
          em vez de ficar com a metade direita vazia. */}
      <Grid.Item span={THIRD_SPAN}>
        <Card.Kpi>
          <Card.Kpi.Label>
            {isSellerView ? "Repassado em " : "Recebido em "}
            {monthLabel(month)}
          </Card.Kpi.Label>
          <Card.Kpi.Value>{formatMoney(totals.received)}</Card.Kpi.Value>
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
