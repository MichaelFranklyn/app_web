import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { VisitDay } from "../../interface";
import { formatDistanceKm, formatMinutes } from "../../utils";

interface Props {
  day: VisitDay;
}

export function RouteSummary({ day }: Props) {
  const totalVisitMin = day.items.reduce(
    (sum, item) => sum + (item.estimatedTravelMin ?? 0),
    0
  );

  return (
    <Grid.Root cols={{ base: 2, desktop: 4 }} gap={12}>
      <Card.Kpi>
        <Card.Kpi.Label>Paradas</Card.Kpi.Label>
        <Card.Kpi.Value status="neutral" className="text-(--blue)!">
          {day.items.length}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>clientes hoje</Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Distância total</Card.Kpi.Label>
        <Card.Kpi.Value status="neutral">
          {formatDistanceKm(day.routeDistanceKm)}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>rota otimizada</Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Tempo de deslocamento</Card.Kpi.Label>
        <Card.Kpi.Value status="neutral">
          {formatMinutes(day.routeDurationMin)}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>estimado</Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Tempo de visita</Card.Kpi.Label>
        <Card.Kpi.Value status="neutral">
          {totalVisitMin > 0 ? formatMinutes(totalVisitMin) : "—"}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>total planejado</Card.Kpi.Delta>
      </Card.Kpi>
    </Grid.Root>
  );
}
