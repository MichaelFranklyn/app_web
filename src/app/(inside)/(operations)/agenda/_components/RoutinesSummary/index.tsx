import { Grid } from "@/components/Grid";
import { StatCard } from "@/components/StatCard";
import { useMemo } from "react";
import { VisitScheduleDay } from "../../interface";

interface Props {
  days: VisitScheduleDay[];
}

/**
 * Os números da semana numa faixa baixa, com os quatro lado a lado até no
 * celular. Eram quatro cartões altos que empurravam os dias para baixo da
 * dobra — e o dia é o que o vendedor abre a Agenda para ver.
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
    <Grid.Root cols={{ base: 4 }} gap={8}>
      <StatCard
        label="Visitas"
        value={stats.visits}
        tone="blue"
        hint="Visitas presenciais marcadas nesta semana."
      />
      <StatCard
        label="Contatos"
        value={stats.contacts}
        tone="secondary"
        hint="Ligações e mensagens marcadas nesta semana."
      />
      <StatCard
        label="Feitas"
        value={`${stats.completed}/${stats.total}`}
        tone="green"
        hint={`${stats.completionRate}% do que foi marcado já está feito.`}
      />
      <StatCard
        label="Ausências"
        value={stats.absent}
        tone={stats.absent > 0 ? "red" : "muted"}
        hint="Visitas em que o cliente não foi encontrado."
      />
    </Grid.Root>
  );
}
