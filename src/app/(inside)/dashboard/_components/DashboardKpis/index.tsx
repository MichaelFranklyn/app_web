import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { formatMoney } from "@/utils/format/masks";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  totalOrders: number;
  totalRevenue: number;
  completedVisits: number;
  totalPlannedVisits: number;
  totalClients: number;
}

export function DashboardKpis({
  totalOrders,
  totalRevenue,
  completedVisits,
  totalPlannedVisits,
  totalClients,
}: Props) {
  const completionRate =
    totalPlannedVisits > 0
      ? Math.round((completedVisits / totalPlannedVisits) * 100)
      : 0;

  return (
    <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Pedidos no período</Card.Kpi.Label>
          <Card.Kpi.Value status="atencao">{totalOrders}</Card.Kpi.Value>
          <Card.Kpi.Delta positive={totalOrders > 0}>
            {totalOrders > 0 && <TrendingUp size={12} />}
            {totalOrders > 0
              ? "pedidos cadastrados"
              : "nenhum pedido no período"}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Faturamento</Card.Kpi.Label>
          <Card.Kpi.Value status="ok">{formatMoney(totalRevenue)}</Card.Kpi.Value>
          <Card.Kpi.Delta positive={totalRevenue > 0}>
            {totalRevenue > 0 && <TrendingUp size={12} />}
            soma dos pedidos do período
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Visitas realizadas</Card.Kpi.Label>
          <Card.Kpi.Value status="neutral" className="text-(--blue)!">
            {completedVisits}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>
            {totalPlannedVisits > 0
              ? `de ${totalPlannedVisits} planejadas · ${completionRate}%`
              : "sem rotina ativa"}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Clientes ativos</Card.Kpi.Label>
          <Card.Kpi.Value status={totalClients > 0 ? "ok" : "urgente"}>
            {totalClients}
          </Card.Kpi.Value>
          <Card.Kpi.Delta negative={totalClients === 0}>
            {totalClients === 0 && <TrendingDown size={12} />}
            {totalClients > 0
              ? "vinculados à empresa"
              : "nenhum cliente vinculado"}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>
    </Grid.Root>
  );
}
