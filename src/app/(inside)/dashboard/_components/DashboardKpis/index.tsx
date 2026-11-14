import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { formatMoney } from "@/utils/format/masks";
import { TrendingDown } from "lucide-react";

interface Props {
  totalOrders: number;
  totalRevenue: number;
  completedVisits: number;
  totalPlannedVisits: number;
  totalClients: number;
  /** Empresa sem o motor de rotina no plano não vê o cartão de visitas: "0
   * realizadas" pareceria uma semana parada, e não um recurso que ela não tem. */
  hasRoutines: boolean;
}

/**
 * Cor no número só quando ela diz um ESTADO (auditoria UX, item 17): contar
 * pedidos ou somar faturamento não é bom nem ruim, então sai em tinta neutra;
 * vermelho fica para "nenhum cliente", que é um problema de verdade. A seta
 * verde de "subiu" também saiu — não há período anterior para comparar.
 */
export function DashboardKpis({
  totalOrders,
  totalRevenue,
  completedVisits,
  totalPlannedVisits,
  totalClients,
  hasRoutines,
}: Props) {
  const completionRate =
    totalPlannedVisits > 0
      ? Math.round((completedVisits / totalPlannedVisits) * 100)
      : 0;

  return (
    <Grid.Root
      cols={{ base: 2, tablet: 2, "desktop-xl": hasRoutines ? 4 : 3 }}
      gap={12}
    >
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Pedidos no período</Card.Kpi.Label>
          <Card.Kpi.Value>{totalOrders}</Card.Kpi.Value>
          <Card.Kpi.Delta>
            {totalOrders > 0
              ? "pedidos cadastrados"
              : "nenhum pedido no período"}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Faturamento</Card.Kpi.Label>
          <Card.Kpi.Value>{formatMoney(totalRevenue)}</Card.Kpi.Value>
          <Card.Kpi.Delta>soma dos pedidos do período</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      {hasRoutines && (
        <Grid.Item>
          <Card.Kpi>
            <Card.Kpi.Label>Visitas realizadas</Card.Kpi.Label>
            <Card.Kpi.Value>{completedVisits}</Card.Kpi.Value>
            <Card.Kpi.Delta>
              {totalPlannedVisits > 0
                ? `de ${totalPlannedVisits} planejadas · ${completionRate}%`
                : "sem rotina ativa"}
            </Card.Kpi.Delta>
          </Card.Kpi>
        </Grid.Item>
      )}

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Clientes ativos</Card.Kpi.Label>
          <Card.Kpi.Value status={totalClients > 0 ? "neutral" : "urgente"}>
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
