import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PortalSentOrdersSummary } from "../../../interface";

interface SentOrdersKpisProps {
  summary: PortalSentOrdersSummary;
}

/**
 * Os quatro números do placar: os pedidos feitos e o caminho dos orçamentos
 * (aguardando → visto → virou pedido ou não foi adiante). Quem virou pedido
 * conta em "Pedidos feitos".
 */
function sentOrdersKpis(summary: PortalSentOrdersSummary) {
  return [
    {
      label: "Pedidos feitos",
      value: summary.ordered,
      hint: "confirmados com o representante",
    },
    {
      label: "Aguardando",
      value: summary.waiting,
      hint: "orçamentos que ele ainda não viu",
    },
    {
      label: "Vistos",
      value: summary.seen,
      hint: "orçamentos que ele está conferindo",
    },
    {
      label: "Não foram adiante",
      value: summary.cancelled,
      hint: "orçamentos cancelados",
    },
  ];
}

/**
 * O placar da lista de pedidos — o mesmo grid de KPIs das listas do sistema.
 * Conta TODOS os pedidos do cliente, não só os da página aberta.
 */
export function SentOrdersKpis({ summary }: SentOrdersKpisProps) {
  return (
    <Grid.Root cols={{ base: 2, tablet: 2, desktop: 4 }} gap={20}>
      {sentOrdersKpis(summary).map(({ label, value, hint }) => (
        <Grid.Item key={label}>
          <Card.Kpi>
            <Card.Kpi.Label>{label}</Card.Kpi.Label>
            <Card.Kpi.Value>{value}</Card.Kpi.Value>
            <Card.Kpi.Delta>{hint}</Card.Kpi.Delta>
          </Card.Kpi>
        </Grid.Item>
      ))}
    </Grid.Root>
  );
}

/** O esqueleto do placar, para o `loading.tsx`. */
export function SentOrdersKpisSkeleton() {
  return (
    <Grid.Root cols={{ base: 2, tablet: 2, desktop: 4 }} gap={20}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid.Item key={index}>
          <Card.Kpi>
            <Loading.Skeleton className="h-[12px] w-[96px]" />
            <Loading.Skeleton className="mt-8 h-[28px] w-[48px]" />
            <Loading.Skeleton className="mt-8 h-[10px] w-[112px]" />
          </Card.Kpi>
        </Grid.Item>
      ))}
    </Grid.Root>
  );
}
