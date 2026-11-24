import { Title } from "@/components/Title";
import { plural } from "@/utils/format/plural";
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
    // Quatro números pequenos em 2×2, sem cartão em volta de cada um: eram
    // quatro KPIs grandes que tomavam meia tela para dizer pouco (relato de
    // 23/11/2026, "essa box da rota do dia tá muito grande"). Agora são uma
    // faixa dentro do card do trajeto.
    <div className="grid grid-cols-2 gap-x-16 gap-y-12">
      <Stat
        label="Paradas"
        value={String(stopCount)}
        hint={
          remoteCount > 0
            ? `+ ${plural(remoteCount, "contato", "contatos")}`
            : "clientes no dia"
        }
      />
      <Stat
        label="Distância total"
        value={formatDistanceKm(distanceKm)}
        hint={combined ? "somando os escritórios" : "rota otimizada"}
      />
      <Stat
        label="Deslocamento"
        value={formatMinutes(durationMin)}
        hint="ida e volta"
      />
      <Stat
        label="Tempo de visita"
        value={visitMin > 0 ? formatMinutes(visitMin) : "—"}
        hint={endsAt ? `última termina ${endsAt}` : "total planejado"}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <Title variant="micro" color="muted">
        {label}
      </Title>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-6">
        <Title variant="body-md" weight="semibold">
          {value}
        </Title>
        <Title variant="micro" color="muted">
          {hint}
        </Title>
      </div>
    </div>
  );
}
