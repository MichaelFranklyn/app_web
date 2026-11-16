import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { CrossOfficeDayRoute, VisitScheduleDay } from "../../interface";
import { formatDistanceKm, formatMinutes } from "../../utils";

interface Props {
  /** O dia de cá — nulo quando só o outro escritório tem parada nele. */
  day: VisitScheduleDay | null;
  /** Visitas presenciais da pessoa no outro escritório (sem par aqui). */
  theirStopCount?: number;
  /**
   * A rota somando os escritórios. Quando vem, os números são os dela — a
   * pessoa faz um trajeto só, não dois.
   */
  combined?: CrossOfficeDayRoute | null;
}

export function RouteSummary({
  day,
  theirStopCount = 0,
  combined = null,
}: Props) {
  const items = day?.items ?? [];
  // Parada é deslocamento. Um contato remoto está no dia, mas não é parada — se
  // entrasse na conta, o vendedor leria "12 paradas" num dia de 8 visitas.
  const drivingStops = items.filter((i) => i.contactType !== "REMOTE");
  const remoteCount = items.length - drivingStops.length;
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

  const stopCount = combined?.stopCount ?? drivingStops.length + theirStopCount;
  const distanceKm = combined?.distanceKm ?? day?.routeDistanceKm ?? "0";
  const durationMin = combined?.durationMin ?? day?.routeDurationMin ?? 0;
  const visitMin = combined?.visitDurationMin ?? totalVisitMin;
  const endsAt = combined ? combined.lastEndTime : lastEnd;

  return (
    <Grid.Root cols={{ base: 2, desktop: 4 }} gap={12}>
      <Card.Kpi>
        <Card.Kpi.Label>Paradas</Card.Kpi.Label>
        <Card.Kpi.Value>{stopCount}</Card.Kpi.Value>
        <Card.Kpi.Delta>
          {remoteCount > 0
            ? `+ ${remoteCount} ${remoteCount === 1 ? "contato" : "contatos"}`
            : "clientes hoje"}
        </Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Distância total</Card.Kpi.Label>
        <Card.Kpi.Value status="neutral">
          {formatDistanceKm(distanceKm)}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>
          {combined ? "somando os escritórios" : "rota otimizada"}
        </Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Tempo de deslocamento</Card.Kpi.Label>
        <Card.Kpi.Value status="neutral">
          {formatMinutes(durationMin)}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>ida e volta</Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Tempo de visita</Card.Kpi.Label>
        <Card.Kpi.Value status="neutral">
          {visitMin > 0 ? formatMinutes(visitMin) : "—"}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>
          {endsAt ? `última termina ${endsAt}` : "total planejado"}
        </Card.Kpi.Delta>
      </Card.Kpi>
    </Grid.Root>
  );
}
