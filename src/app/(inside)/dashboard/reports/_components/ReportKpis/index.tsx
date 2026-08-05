import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";

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
  if (loading) {
    return (
      <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
        {items.map((item) => (
          <Grid.Item key={item.label}>
            <Loading.Skeleton className="h-[104px] w-full" />
          </Grid.Item>
        ))}
      </Grid.Root>
    );
  }

  return (
    <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
      {items.map((item) => (
        <Grid.Item key={item.label}>
          <Card.Kpi>
            <Card.Kpi.Label>{item.label}</Card.Kpi.Label>
            <Card.Kpi.Value status={item.status ?? "neutral"}>
              {item.value}
            </Card.Kpi.Value>
            {item.hint && <Card.Kpi.Delta>{item.hint}</Card.Kpi.Delta>}
          </Card.Kpi>
        </Grid.Item>
      ))}
    </Grid.Root>
  );
}
