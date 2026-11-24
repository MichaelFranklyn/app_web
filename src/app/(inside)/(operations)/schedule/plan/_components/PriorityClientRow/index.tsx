"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/Badges";
import { InputCheckbox } from "@/components/Input/InputCheckbox";
import { SelectableRow } from "@/components/SelectableRow";
import { Title } from "@/components/Title";
import { useCompanyBranding } from "@/hooks/useCompanyBranding";
import type { VisitContactType } from "@/utils/visit";
import { useId } from "react";

import { PriorityClient, StopChoice } from "../../interface";
import { dayChipLabel, factoryScoreLine, scheduledLabel } from "../../utils";
import { FactoryScoreBadge } from "../FactoryScoreBadge";
import { FactoryScoreBadges } from "../FactoryScoreBadges";
import { StopOptions } from "../StopOptions";
import { TierBadge } from "../TierBadge";

/** No celular cada tag toma a linha: lida de cima a baixo, como uma ficha. */
const FULL_ON_MOBILE = "max-desktop:w-full max-desktop:justify-center";

/**
 * A caixinha (24px) + o gap (12px). No desktop, o que vem abaixo do nome se
 * alinha com ele; no celular, volta para a borda: a caixinha fica só na linha
 * do nome e o resto ganha a largura toda.
 */
const UNDER_CHECKBOX = "max-desktop:-ml-[36px]";

/**
 * No desktop a primeira linha tem a altura do selo de score (~33px); o nome
 * (21px) desce 6px para ficar no meio dela. A caixinha desce o mesmo tanto.
 */
const NAME_LINE_OFFSET = "desktop:mt-6";

interface Props {
  client: PriorityClient;
  choice: StopChoice | undefined;
  onToggle: () => void;
  onContactTypeChange: (contactType: VisitContactType) => void;
  onWeekdayChange: (weekday: number | null) => void;
}

/**
 * Um cliente da carteira, compacto: quem é com o score mais alto ao lado,
 * onde fica, as outras fábricas e se já tem dia marcado. O motivo da visita
 * fica no tooltip de cada selo de score. Marcado, ganha as escolhas de como e quando.
 */
export function PriorityClientRow({
  client,
  choice,
  onToggle,
  onContactTypeChange,
  onWeekdayChange,
}: Props) {
  const checkboxId = useId();
  const { name: currentOffice } = useCompanyBranding();
  const scores = factoryScoreLine(client, currentOffice);
  const already = scheduledLabel(client.scheduled);
  const place = [client.neighborhood, client.cityLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <SelectableRow selected={Boolean(choice)}>
      <div className="flex items-start gap-12">
        <InputCheckbox
          id={checkboxId}
          checked={Boolean(choice)}
          onChange={onToggle}
          aria-label={`Escolher ${client.name}`}
          // Da altura de uma linha do nome (21px), para a caixinha ficar no
          // meio dela — e no topo, quando o nome quebra em duas.
          className={cn("h-[21px] min-h-0", NAME_LINE_OFFSET)}
        />
        {/* A linha inteira marca o cliente, não só a caixinha: ela é pequena
            para quem tem a mão menos firme, e o nome é onde o olho está. */}
        <SelectableRow.Target htmlFor={checkboxId}>
          {/* No desktop a prioridade fica ao lado do nome e o score mais alto
              fecha a linha, à direita, para a lista ser lida de cima a baixo
              como um ranking. No celular o score desce para baixo do nome e a
              prioridade para baixo do score, cada um na largura toda.
              Alinhados ao topo (não ao centro): um nome em duas linhas não
              arrasta os selos nem a caixinha para o meio dele. */}
          <div className="flex flex-wrap items-start gap-6">
            <Title
              variant="body-sm"
              weight="medium"
              className={NAME_LINE_OFFSET}
            >
              {client.name}
            </Title>
            <TierBadge
              tier={client.tier}
              className={cn(
                "max-desktop:order-last max-desktop:w-[calc(100%+36px)] max-desktop:justify-center",
                UNDER_CHECKBOX
              )}
            />
            {scores.top && (
              <span
                className={cn(
                  "desktop:ml-auto max-desktop:w-[calc(100%+36px)]",
                  UNDER_CHECKBOX
                )}
              >
                <FactoryScoreBadge chip={scores.top}>
                  Score {scores.top.score}
                </FactoryScoreBadge>
              </span>
            )}
          </div>
          <div className={cn("flex flex-col gap-4", UNDER_CHECKBOX)}>
            {/* Rotulada: só "Itapuã · Salvador" solto não diz o que é. */}
            {place && (
              <div className="flex flex-wrap items-center gap-x-6">
                <Title variant="body-xs" color="muted" as="span">
                  Localização:
                </Title>
                <Title variant="body-xs" color="secondary" as="span">
                  {place}
                </Title>
              </div>
            )}
            {/* As outras fábricas — inclusive as de outro escritório, que
              também puxam a posição na fila. */}
            <FactoryScoreBadges
              clientName={client.name}
              chips={scores.chips}
              rest={scores.rest}
            />
          </div>
        </SelectableRow.Target>
      </div>
      {/* Tags, visita × contato e dia numa linha só: empilhados, cada
          cliente escolhido virava três linhas. */}
      <div className="desktop:pl-[36px] flex flex-wrap items-center gap-6">
        {client.isForced && (
          <Badge.Root
            color="blue"
            appearance="tinted"
            size="sm"
            className={FULL_ON_MOBILE}
            title="O cliente pediu visita num contato anterior."
          >
            <Badge.Text>Pediu visita</Badge.Text>
          </Badge.Root>
        )}
        {client.availableFrom && (
          <Badge.Root
            color="neutral"
            appearance="tinted"
            size="sm"
            className={FULL_ON_MOBILE}
            title="O cliente pediu para ser procurado só a partir deste dia."
          >
            <Badge.Text>
              A partir de {dayChipLabel(client.availableFrom)}
            </Badge.Text>
          </Badge.Root>
        )}
        {already && (
          <Badge.Root
            color="green"
            appearance="tinted"
            size="sm"
            className={FULL_ON_MOBILE}
            title="Já está na sua agenda desta semana."
          >
            <Badge.Text>Já marcado: {already}</Badge.Text>
          </Badge.Root>
        )}
        {choice && (
          <StopOptions
            clientName={client.name}
            choice={choice}
            onContactTypeChange={onContactTypeChange}
            onWeekdayChange={onWeekdayChange}
          />
        )}
      </div>
    </SelectableRow>
  );
}
