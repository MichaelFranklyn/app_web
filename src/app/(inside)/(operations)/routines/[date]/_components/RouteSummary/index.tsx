import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { VisitDay } from "../../interface";
import { formatDistanceKm, formatMinutes } from "../../utils";

interface Props {
  day: VisitDay;
}

export function RouteSummary({ day }: Props) {
  // Parada é deslocamento. Um contato remoto está no dia, mas não é parada — se
  // entrasse na conta, o vendedor leria "12 paradas" num dia de 8 visitas.
  const drivingStops = day.items.filter((i) => i.contactType !== "REMOTE");
  const remoteCount = day.items.length - drivingStops.length;
  // Tempo DE VISITA é a soma da duração das paradas — antes somava
  // `estimatedTravelMin`, ou seja, mostrava o deslocamento com o rótulo de
  // visita (e o dia inteiro parecia render "70 min de visita" para 8 clientes).
  const totalVisitMin = drivingStops.reduce(
    (sum, item) => sum + (item.visitDurationMin ?? 0),
    0
  );
  // Fim previsto do dia: a última parada da agenda. O deslocamento de volta para
  // casa está no total do dia (a rota é ida e volta), mas não tem horário
  // próprio — por isso o rótulo fala da última visita.
  const lastEnd = drivingStops.reduce<string | null>(
    (latest, item) =>
      item.plannedEndTime && (!latest || item.plannedEndTime > latest)
        ? item.plannedEndTime
        : latest,
    null
  );

  return (
    <Grid.Root cols={{ base: 2, desktop: 4 }} gap={12}>
      <Card.Kpi>
        <Card.Kpi.Label>Paradas</Card.Kpi.Label>
        <Card.Kpi.Value status="neutral" className="text-(--blue)!">
          {drivingStops.length}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>
          {remoteCount > 0
            ? `+ ${remoteCount} ${remoteCount === 1 ? "contato" : "contatos"}`
            : "clientes hoje"}
        </Card.Kpi.Delta>
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
        <Card.Kpi.Delta>ida e volta</Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Tempo de visita</Card.Kpi.Label>
        <Card.Kpi.Value status="neutral">
          {totalVisitMin > 0 ? formatMinutes(totalVisitMin) : "—"}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>
          {lastEnd ? `última termina ${lastEnd}` : "total planejado"}
        </Card.Kpi.Delta>
      </Card.Kpi>
    </Grid.Root>
  );
}
