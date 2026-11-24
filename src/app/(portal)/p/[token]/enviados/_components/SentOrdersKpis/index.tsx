import { Card } from "@/components/Card";
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
    <Card.Kpi.Group>
      {sentOrdersKpis(summary).map(({ label, value, hint }) => (
        <Card.Kpi key={label}>
          <Card.Kpi.Label>{label}</Card.Kpi.Label>
          <Card.Kpi.Value>{value}</Card.Kpi.Value>
          <Card.Kpi.Delta>{hint}</Card.Kpi.Delta>
        </Card.Kpi>
      ))}
    </Card.Kpi.Group>
  );
}

/** O esqueleto do placar, para o `loading.tsx`. */
export function SentOrdersKpisSkeleton() {
  return (
    <Card.Kpi.Group>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card.Kpi.Skeleton key={index} />
      ))}
    </Card.Kpi.Group>
  );
}
