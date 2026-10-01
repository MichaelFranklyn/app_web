"use client";

import { MapPinned } from "lucide-react";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";

interface Props {
  /** Viagem que criou a parada. Nulo = parada da rotina de casa. */
  tripId?: string | null;
  className?: string;
}

/**
 * "Viagem" — esta parada é de uma viagem planejada, não da rotina de casa.
 *
 * Na mesma forma do `FixedVisitTag`, ao lado do qual aparece: ícone e palavra
 * juntos, porque o público é idoso e um ícone sozinho não se lê de relance.
 */
export function TripVisitTag({ tripId, className }: Props) {
  if (!tripId) return null;

  return (
    <span
      className={cn("inline-flex items-center gap-4", className)}
      title="Parada de uma viagem planejada — cancelar a viagem tira esta visita da rotina."
    >
      <MapPinned size={13} aria-hidden className="shrink-0 text-(--purple)" />
      <Title variant="micro" color="default">
        Viagem
      </Title>
    </span>
  );
}
