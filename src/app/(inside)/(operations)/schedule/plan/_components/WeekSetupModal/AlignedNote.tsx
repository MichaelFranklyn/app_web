"use client";

import { Alert } from "@/components/Alert";

import { dayChipLabel } from "../../utils";
import { AlignedStop } from "./interface";

interface Props {
  aligned: AlignedStop[];
}

const sentenceFor = (stop: AlignedStop) =>
  stop.movesOtherOffice && stop.fromDate
    ? `${stop.name}: a visita do ${stop.officeName} passa de ${dayChipLabel(stop.fromDate)} para ${dayChipLabel(stop.toDate)}`
    : `${stop.name} vai para ${dayChipLabel(stop.toDate)}, o dia da visita do ${stop.officeName}`;

/**
 * O que a montagem alinhou com o outro escritório da pessoa: o mesmo cliente
 * nos dois, no mesmo dia, é uma ida só. Mostra só quem e quando — nada de
 * fábrica, preço ou comissão do outro escritório.
 */
export function AlignedNote({ aligned }: Props) {
  if (aligned.length === 0) return null;
  return (
    <Alert.Root variant="info">
      <Alert.Content>
        <Alert.Title>Juntamos visitas no mesmo dia</Alert.Title>
        <Alert.Description>
          {aligned.map(sentenceFor).join("; ")}. Assim você vai uma vez só a
          cada cliente.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
