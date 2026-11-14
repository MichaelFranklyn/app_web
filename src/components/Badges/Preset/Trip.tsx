"use client";

import { MapPinned } from "lucide-react";
import { BadgeIcon } from "../Icon";
import { BadgeRoot } from "../Root";
import { BadgeText } from "../Text";

interface Props {
  /** Viagem que criou a parada. Nulo = parada da rotina de casa. */
  tripId?: string | null;
  className?: string;
}

/** "Viagem" — esta parada é de uma viagem planejada, não da rotina de casa. */
export function BadgeTrip({ tripId, className }: Props) {
  if (!tripId) return null;

  return (
    <BadgeRoot
      color="purple"
      className={className}
      title="Parada de uma viagem planejada — cancelar a viagem tira esta visita da rotina."
    >
      <BadgeIcon>
        <MapPinned />
      </BadgeIcon>
      <BadgeText>Viagem</BadgeText>
    </BadgeRoot>
  );
}
