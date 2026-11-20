"use client";

import { Badge } from "@/components/Badges";
import { cn } from "@/lib/utils";

import { FactoryScoreHint } from "../../../_components/FactoryScoreHint";
import { FactoryScoreChip } from "../../utils";
import { PlannedStop } from "./interface";

interface Props {
  stop: PlannedStop;
  /** Score por fábrica do cliente (todos os escritórios); vazio sem dado. */
  chips: FactoryScoreChip[];
}

/**
 * Os selos da parada na prévia: o tipo de contato, de onde ela vem (outro
 * escritório da pessoa) e se é desta montagem ("Novo"/"Sugerido"). O mouse
 * no tipo mostra o score e o motivo de cada fábrica; no escritório, só as
 * fábricas de lá — o mesmo tooltip de Montar semana.
 */
export function StopBadges({ stop, chips }: Props) {
  const chipsOf = (office: string) =>
    chips.filter((chip) => chip.office === office);
  const officeChips = stop.officeName ? chipsOf(stop.officeName) : [];
  const alsoChips = stop.alsoInOffice ? chipsOf(stop.alsoInOffice) : [];
  const officeHint = `Visita da sua rotina no ${stop.officeName}. Conta no tamanho do dia.`;
  const alsoHint = `Este cliente também tem visita neste dia no ${stop.alsoInOffice}: é uma ida só.`;
  return (
    // Desktop: ao lado do nome, até metade da linha (o resto corta com "…" e
    // o nome inteiro fica no title). Celular: cada selo toma a linha.
    <div className="max-desktop:max-w-full max-desktop:flex-col max-desktop:items-stretch max-desktop:[&>*]:w-full flex max-w-[50%] shrink-0 flex-wrap items-center justify-end gap-6">
      <FactoryScoreHint chips={chips} title="Score por fábrica">
        <Badge.ContactType
          contactType={stop.contactType}
          className={cn(chips.length > 0 && "cursor-help")}
        />
      </FactoryScoreHint>
      {stop.officeName && (
        <FactoryScoreHint chips={officeChips} title={officeHint}>
          <Badge.Root
            color="purple"
            appearance="tinted"
            title={officeChips.length ? undefined : officeHint}
            className={cn(officeChips.length > 0 && "cursor-help")}
          >
            <Badge.Text>{stop.officeName}</Badge.Text>
          </Badge.Root>
        </FactoryScoreHint>
      )}
      {stop.alsoInOffice && (
        <FactoryScoreHint chips={alsoChips} title={alsoHint}>
          <Badge.Root
            color="purple"
            appearance="outline"
            title={alsoChips.length ? undefined : alsoHint}
            className={cn(alsoChips.length > 0 && "cursor-help")}
          >
            <Badge.Text>Também no {stop.alsoInOffice}</Badge.Text>
          </Badge.Root>
        </FactoryScoreHint>
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
