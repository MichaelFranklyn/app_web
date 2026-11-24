"use client";

import { Card } from "@/components/Card";
import { formatMoney } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";

import type { MonthSummary } from "../../utils";

interface Props {
  totals: MonthSummary;
  /** Gestor olhando a fatia do vendedor: os rótulos passam a falar de repasse. */
  isSellerView: boolean;
  isLoading: boolean;
}

/** Os três números do mês: a receber, previsto e recebido. */
// Sem o mês nos rótulos: o título "Resumo de <mês>" logo acima já diz qual é,
// e "A receber em novembro de 2026" quebrava em duas linhas no celular
// (crítica de /commissions, 23/11/2026).
export function MonthKpis({ totals, isSellerView, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card.Kpi.Group data-tour="commissions-kpis">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card.Kpi.Skeleton key={i} />
        ))}
      </Card.Kpi.Group>
    );
  }

  return (
    <Card.Kpi.Group data-tour="commissions-kpis">
      <Card.Kpi>
        <Card.Kpi.Label>
          {isSellerView ? "Repasse a receber" : "A receber"}
        </Card.Kpi.Label>
        {/* Neutro: dinheiro a receber é o normal do mês, não um alerta. */}
        <Card.Kpi.Value status="neutral">
          {formatMoney(totals.receivable)}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>
          {totals.chargeback < 0
            ? `${plural(totals.countReceivable, "parcela", "parcelas")} · estornos de ${formatMoney(Math.abs(totals.chargeback))} já descontados`
            : `${plural(totals.countReceivable, "parcela", "parcelas")} a receber`}
        </Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>
          {isSellerView ? "Repasse previsto" : "Previsto"}
        </Card.Kpi.Label>
        <Card.Kpi.Value>{formatMoney(totals.pending)}</Card.Kpi.Value>
        <Card.Kpi.Delta>Depende de faturamento ou pagamento</Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>
          {isSellerView ? "Repassado" : "Recebido"}
        </Card.Kpi.Label>
        <Card.Kpi.Value>{formatMoney(totals.received)}</Card.Kpi.Value>
        <Card.Kpi.Delta>
          {isSellerView
            ? "Já pago pelo escritório ao vendedor"
            : "Já repassado pelas fábricas"}
        </Card.Kpi.Delta>
      </Card.Kpi>
    </Card.Kpi.Group>
  );
}
