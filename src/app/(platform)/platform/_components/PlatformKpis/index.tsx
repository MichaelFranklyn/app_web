import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { formatMoney } from "@/utils/format/masks";
import { PlatformOverview } from "../../interface";
import { dormantCompanies, engagementRate } from "../../utils";

/**
 * Os quatro números que respondem "como está a plataforma".
 *
 * A escolha é deliberada: contagem crua de empresas diz pouco sozinha — cem
 * cadastros com cinco em uso é um problema, não um resultado. Por isso cada
 * bloco traz o total e, logo abaixo, o recorte que o qualifica.
 */
export function PlatformKpis({ overview }: { overview: PlatformOverview }) {
  const rate = engagementRate(overview);
  const dormant = dormantCompanies(overview);

  return (
    <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Empresas</Card.Kpi.Label>
          <Card.Kpi.Value status="neutral">
            {overview.totalCompanies}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>
            {overview.activeCompanies} ativas
            {overview.suspendedCompanies > 0 &&
              ` · ${overview.suspendedCompanies} suspensas`}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Empresas em uso</Card.Kpi.Label>
          {/* O tom acompanha a taxa: metade da base parada é um alerta, e um
              número neutro esconderia isso atrás de um verde qualquer. */}
          <Card.Kpi.Value
            status={rate >= 70 ? "ok" : rate >= 40 ? "atencao" : "urgente"}
          >
            {overview.engagedCompanies}
          </Card.Kpi.Value>
          <Card.Kpi.Delta negative={dormant > 0}>
            {rate}% das ativas
            {dormant > 0 && ` · ${dormant} sem entrar no período`}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Pessoas</Card.Kpi.Label>
          <Card.Kpi.Value status="neutral" className="text-(--blue)!">
            {overview.totalUsers}
          </Card.Kpi.Value>
          <Card.Kpi.Delta>
            {overview.activeUsersInPeriod} entraram no período
            {overview.neverLoggedUsers > 0 &&
              ` · ${overview.neverLoggedUsers} nunca entraram`}
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>

      <Grid.Item>
        <Card.Kpi>
          <Card.Kpi.Label>Volume no período</Card.Kpi.Label>
          <Card.Kpi.Value
            status={overview.ordersInPeriod > 0 ? "ok" : "urgente"}
          >
            {formatMoney(overview.gmvInPeriod)}
          </Card.Kpi.Value>
          <Card.Kpi.Delta positive={overview.ordersInPeriod > 0}>
            {overview.ordersInPeriod} pedidos · {overview.totalOrders} no total
          </Card.Kpi.Delta>
        </Card.Kpi>
      </Grid.Item>
    </Grid.Root>
  );
}
