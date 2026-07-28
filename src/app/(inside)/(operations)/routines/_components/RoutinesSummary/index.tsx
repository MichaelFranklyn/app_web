import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { ArrowUp } from "lucide-react";
import { useMemo } from "react";
import { VisitScheduleDay } from "../../interface";

interface Props {
  days: VisitScheduleDay[];
}

export function RoutinesSummary({ days }: Props) {
  const stats = useMemo(() => {
    const items = days.flatMap((day) => day.items);
    const total = items.length;
    // Visitas e contatos aparecem separados: a taxa de conclusão continua sobre
    // o total (os dois são trabalho), mas "8 visitas" não pode virar "12" só
    // porque o vendedor também tem 4 ligações na semana.
    const visits = items.filter((i) => i.contactType !== "REMOTE").length;
    const contacts = total - visits;
    const completed = items.filter((i) => i.status === "COMPLETED").length;
    const absent = items.filter((i) => i.status === "CLIENT_ABSENT").length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { visits, contacts, completed, absent, completionRate };
  }, [days]);

  return (
    <Grid.Root cols={{ base: 2, desktop: 4 }} gap={12}>
      <Card.Kpi>
        <Card.Kpi.Label>Visitas planejadas</Card.Kpi.Label>
        <Card.Kpi.Value status="neutral" className="text-(--blue)!">
          {stats.visits}
        </Card.Kpi.Value>
        <Card.Kpi.Delta>
          {stats.contacts > 0
            ? `+ ${stats.contacts} ${stats.contacts === 1 ? "contato" : "contatos"}`
            : "esta semana"}
        </Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Realizadas</Card.Kpi.Label>
        <Card.Kpi.Value status="ok">{stats.completed}</Card.Kpi.Value>
        <Card.Kpi.Delta positive>
          <ArrowUp size={14} className="shrink-0" />
          {stats.completionRate}% de conclusão
        </Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Ausências</Card.Kpi.Label>
        <Card.Kpi.Value status="urgente">{stats.absent}</Card.Kpi.Value>
        <Card.Kpi.Delta negative={stats.absent > 0}>
          {stats.absent > 0 ? "cliente não encontrado" : "sem ausências"}
        </Card.Kpi.Delta>
      </Card.Kpi>
      <Card.Kpi>
        <Card.Kpi.Label>Dias com rota</Card.Kpi.Label>
        <Card.Kpi.Value status="atencao">{days.length}</Card.Kpi.Value>
        <Card.Kpi.Delta>dias programados</Card.Kpi.Delta>
      </Card.Kpi>
    </Grid.Root>
  );
}
