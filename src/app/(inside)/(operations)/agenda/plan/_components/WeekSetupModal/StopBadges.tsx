"use client";

import { Badge } from "@/components/Badges";

import { PlannedStop } from "./interface";

interface Props {
  stop: PlannedStop;
}

/**
 * Os selos da parada na prévia: o tipo de contato, de onde ela vem (outro
 * escritório da pessoa) e se é desta montagem ("Novo"/"Sugerido").
 */
export function StopBadges({ stop }: Props) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-6">
      <Badge.ContactType contactType={stop.contactType} />
      {stop.officeName && (
        <Badge.Root
          color="purple"
          appearance="tinted"
          title={`Visita da sua rotina no ${stop.officeName}. Conta no tamanho do dia.`}
        >
          <Badge.Text>{stop.officeName}</Badge.Text>
        </Badge.Root>
      )}
      {stop.alsoInOffice && (
        <Badge.Root
          color="purple"
          appearance="outline"
          title={`Este cliente também tem visita neste dia no ${stop.alsoInOffice}: é uma ida só.`}
        >
          <Badge.Text>Também no {stop.alsoInOffice}</Badge.Text>
        </Badge.Root>
      )}
      {stop.isNew &&
        (stop.isSuggested ? (
          <Badge.Root
            color="blue"
            appearance="tinted"
            title="Entrou para completar o dia — dá para tirar voltando e mexendo."
          >
            <Badge.Text>Sugerido</Badge.Text>
          </Badge.Root>
        ) : (
          <Badge.Root color="blue" appearance="tinted">
            <Badge.Text>Novo</Badge.Text>
          </Badge.Root>
        ))}
    </div>
  );
}
