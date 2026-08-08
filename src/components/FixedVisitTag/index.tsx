"use client";

import { CalendarCheck } from "lucide-react";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";

interface Props {
  /** Id do compromisso que gerou a parada. Nulo = visita escolhida pelo motor. */
  fixedScheduleId?: string | null;
  className?: string;
}

/**
 * "📅 Dia fixo" — esta parada é um compromisso com o cliente, não uma sugestão.
 *
 * A diferença muda o que o vendedor pode fazer com ela. Uma visita sugerida
 * pelo sistema ele remarca sem consequência nenhuma; um dia fixo é uma promessa
 * que alguém fez ("toda terça eu passo aí"), e quem descobre que ela não foi
 * cumprida é o cliente. Sem a marca, as duas chegam ao vendedor idênticas.
 *
 * Mesma forma do `ContactTypeTag`, que fica ao lado: ícone e palavra juntos,
 * porque o público é idoso e um calendário estilizado não se lê de relance.
 */
export function FixedVisitTag({ fixedScheduleId, className }: Props) {
  if (!fixedScheduleId) return null;

  return (
    <span
      className={cn("inline-flex items-center gap-4", className)}
      title="Compromisso fixo com este cliente"
    >
      <CalendarCheck
        size={13}
        aria-hidden
        className="shrink-0 text-(--amber)"
      />
      <Title variant="micro" color="default">
        Dia fixo
      </Title>
    </span>
  );
}
