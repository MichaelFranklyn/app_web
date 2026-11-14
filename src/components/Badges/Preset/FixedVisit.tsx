"use client";

import { CalendarCheck } from "lucide-react";
import { BadgeIcon } from "../Icon";
import { BadgeRoot } from "../Root";
import { BadgeText } from "../Text";

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
 */
export function BadgeFixedVisit({ fixedScheduleId, className }: Props) {
  if (!fixedScheduleId) return null;

  return (
    <BadgeRoot
      color="cyan"
      className={className}
      title="Compromisso fixo com este cliente"
    >
      <BadgeIcon>
        <CalendarCheck />
      </BadgeIcon>
      <BadgeText>Dia fixo</BadgeText>
    </BadgeRoot>
  );
}
