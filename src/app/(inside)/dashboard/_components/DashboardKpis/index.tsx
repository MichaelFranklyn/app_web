import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { formatMoney } from "@/utils/format/masks";
import {
  CircleDollarSign,
  MapPinCheck,
  ShoppingCart,
  TrendingDown,
  Users,
} from "lucide-react";

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
    // Uma fileira só a partir do desktop. Antes as 4 colunas só vinham em
    // 1600px: num notebook (1293, 1469px) a faixa virava 2×2, cada cartão com
    // ~570px para um número de 25px — muito vazio e o dobro da altura. Com 4
    // colunas em 1024px o cartão tem ~210px, e o número (que mede o próprio
    // cartão, ver kpiValueStyle) ainda cabe "R$ 1.481.481,36" inteiro.
    <Grid.Root
      cols={{ base: 2, tablet: 2, desktop: hasRoutines ? 4 : 3 }}
      gap={12}
    >
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label icon={ShoppingCart}>
            Pedidos no período
          </Card.Kpi.Label>
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
          <Card.Kpi.Label icon={CircleDollarSign}>Faturamento</Card.Kpi.Label>
          <Card.Kpi.Value>{formatMoney(totalRevenue)}</Card.Kpi.Value>
          <Card.Kpi.Delta>soma dos pedidos do período</Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      {hasRoutines && (
        <Grid.Item>
          <Card.Kpi>
            <Card.Kpi.Label icon={MapPinCheck}>
              Visitas realizadas
            </Card.Kpi.Label>
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
          <Card.Kpi.Label icon={Users}>Clientes ativos</Card.Kpi.Label>
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
