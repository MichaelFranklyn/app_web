import { Grid } from "@/components/Grid";
import { Card } from "@/components/Card";
import { useMemo } from "react";
import { VisitScheduleDay } from "../../interface";

interface Props {
  days: VisitScheduleDay[];
}

/**
 * Os números da semana numa faixa baixa. No celular ficam dois por linha: os
 * quatro lado a lado partiam o rótulo no meio da palavra ("Contat/os",
 * "Ausên/cias") — 14/11/2026. Do tablet em diante, os quatro numa linha só.
 */
export function RoutinesSummary({ days }: Props) {
  const stats = useMemo(() => {
    const items = days.flatMap((day) => day.items);
    const total = items.length;
    // Visitas e contatos aparecem separados: a taxa de conclusão continua sobre
    // o total (os dois são trabalho), mas "8 visitas" não pode virar "12" só
    // porque o vendedor também tem 4 ligações na semana.
    const visits = items.filter((i) => i.contactType !== "REMOTE").length;
    const completed = items.filter((i) => i.status === "COMPLETED").length;
    const absent = items.filter((i) => i.status === "CLIENT_ABSENT").length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      total,
      visits,
      contacts: total - visits,
      completed,
      absent,
      completionRate,
    };
  }, [days]);

  return (
    <Grid.Root cols={{ base: 2, tablet: 4 }} gap={8}>
      <Card.Kpi title="Visitas presenciais marcadas nesta semana.">
        <Card.Kpi.Label>Visitas</Card.Kpi.Label>
        <Card.Kpi.Value>{stats.visits}</Card.Kpi.Value>
      </Card.Kpi>
      <Card.Kpi title="Ligações e mensagens marcadas nesta semana.">
        <Card.Kpi.Label>Contatos</Card.Kpi.Label>
        <Card.Kpi.Value>{stats.contacts}</Card.Kpi.Value>
      </Card.Kpi>
      <Card.Kpi
        title={`${stats.completionRate}% do que foi marcado já está feito.`}
      >
        <Card.Kpi.Label>Feitas</Card.Kpi.Label>
        <Card.Kpi.Value>{`${stats.completed}/${stats.total}`}</Card.Kpi.Value>
      </Card.Kpi>
      <Card.Kpi title="Visitas em que o cliente não foi encontrado.">
        <Card.Kpi.Label>Ausências</Card.Kpi.Label>
        <Card.Kpi.Value status={stats.absent > 0 ? "urgente" : "neutral"}>
          {stats.absent}
        </Card.Kpi.Value>
      </Card.Kpi>
    </Grid.Root>
  );
}
