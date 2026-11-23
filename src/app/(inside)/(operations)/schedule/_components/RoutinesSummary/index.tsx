import { Grid } from "@/components/Grid";
import { Card } from "@/components/Card";
import { useMemo } from "react";
import { CrossOfficeStop, VisitScheduleDay } from "../../interface";

interface Props {
  days: VisitScheduleDay[];
  /**
   * As paradas da semana nos OUTROS escritórios que viram cartão na grade.
   * Entram na conta: o resumo que mostra "8 visitas" ao lado de uma grade com
   * 11 cartões parece erro (crítica de 23/11/2026).
   */
  otherOfficeStops?: CrossOfficeStop[];
}

type Stop = { contactType: string; status: string };

/**
 * Os números da semana numa faixa baixa. No celular ficam dois por linha: os
 * quatro lado a lado partiam o rótulo no meio da palavra ("Contat/os",
 * "Ausên/cias") — 14/11/2026. Do tablet em diante, os quatro numa linha só.
 * O valor vai no tamanho pequeno: é contexto da grade, não o assunto da tela.
 */
export function RoutinesSummary({ days, otherOfficeStops = [] }: Props) {
  const stats = useMemo(() => {
    const items: Stop[] = [
      ...days.flatMap((day) => day.items),
      ...otherOfficeStops,
    ];
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
  }, [days, otherOfficeStops]);

  return (
    <Grid.Root cols={{ base: 2, tablet: 4 }} gap={8}>
      <Card.Kpi title="Visitas presenciais marcadas nesta semana, em todos os seus escritórios.">
        <Card.Kpi.Label>Visitas</Card.Kpi.Label>
        <Card.Kpi.Value size="sm">{stats.visits}</Card.Kpi.Value>
      </Card.Kpi>
      <Card.Kpi title="Ligações e mensagens marcadas nesta semana.">
        <Card.Kpi.Label>Contatos</Card.Kpi.Label>
        <Card.Kpi.Value size="sm">{stats.contacts}</Card.Kpi.Value>
      </Card.Kpi>
      <Card.Kpi
        title={`${stats.completionRate}% do que foi marcado já está feito.`}
      >
        <Card.Kpi.Label>Feitas</Card.Kpi.Label>
        <Card.Kpi.Value size="sm">{`${stats.completed}/${stats.total}`}</Card.Kpi.Value>
      </Card.Kpi>
      <Card.Kpi title="Visitas em que o cliente não foi encontrado.">
        <Card.Kpi.Label>Ausências</Card.Kpi.Label>
        <Card.Kpi.Value
          size="sm"
          status={stats.absent > 0 ? "urgente" : "neutral"}
        >
          {stats.absent}
        </Card.Kpi.Value>
      </Card.Kpi>
    </Grid.Root>
  );
}
