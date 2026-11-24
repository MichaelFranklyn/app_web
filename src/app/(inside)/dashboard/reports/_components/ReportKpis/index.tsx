import { Card } from "@/components/Card";

import { ReportKpi } from "../../interface";

interface Props {
  items: ReportKpi[];
  loading?: boolean;
}

/**
 * A faixa de números do relatório: o total do recorte, antes da tabela.
 *
 * Existe porque conferir um relatório começa pelo fechamento — "deu 486 mil?" —
 * e só então se desce à linha que não bateu. Os cartões são montados pela aba
 * (cada relatório fecha em uma grandeza diferente), aqui só se desenham.
 */
export function ReportKpis({ items, loading }: Props) {
  // Colunas e fileira ímpar ficam com o Card.Kpi.Group (regra única do DS).
  if (loading) {
    const withDelta = items.some((item) => item.hint);
    return (
      <Card.Kpi.Group data-tour="reports-kpis">
        {items.map((item) => (
          <Card.Kpi.Skeleton key={item.label} delta={withDelta} />
        ))}
      </Card.Kpi.Group>
    );
  }

  return (
    <Card.Kpi.Group data-tour="reports-kpis">
      {items.map((item) => (
        <Card.Kpi key={item.label}>
          <Card.Kpi.Label>{item.label}</Card.Kpi.Label>
          <Card.Kpi.Value status={item.status ?? "neutral"}>
            {item.value}
          </Card.Kpi.Value>
          {item.hint && <Card.Kpi.Delta>{item.hint}</Card.Kpi.Delta>}
        </Card.Kpi>
      ))}
    </Card.Kpi.Group>
  );
}
