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
/**
 * Colunas da faixa no desktop largo: 4 por padrão, mas 3 quando a contagem
 * fecha em fileiras de 3 e não de 4 (6 cartões viravam 4 + 2 soltos — pedido
 * do usuário, 14/11/2026).
 */
function kpiCols(count: number) {
  // Múltiplo de 3 (e não de 4): 3 por linha já no desktop comum (1440px),
  // não só no desktop-xl — senão 6 cartões viravam 3 fileiras de 2.
  if (count % 3 === 0 && count % 4 !== 0)
    return { base: 2, tablet: 2, desktop: 3 } as const;
  return { base: 2, tablet: 2, "desktop-xl": 4 } as const;
}

export function ReportKpis({ items, loading }: Props) {
  if (loading) {
    return (
      <Grid.Root cols={kpiCols(items.length)} gap={12} data-tour="reports-kpis">
        {items.map((item) => (
          <Grid.Item key={item.label}>
            <Loading.Skeleton className="h-[104px] w-full" />
          </Grid.Item>
        ))}
      </Grid.Root>
    );
  }

  return (
    <Grid.Root cols={kpiCols(items.length)} gap={12} data-tour="reports-kpis">
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
