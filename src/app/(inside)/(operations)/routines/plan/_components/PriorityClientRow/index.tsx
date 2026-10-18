"use client";

import { Badge } from "@/components/Badges";
import { InputCheckbox } from "@/components/Input/InputCheckbox";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import type { VisitContactType } from "@/utils/visit";
import { useId } from "react";

import { PriorityClient, StopChoice } from "../../interface";
import {
  dayChipLabel,
  mainReason,
  scheduledLabel,
  TIER_COLOR,
  TIER_HINT,
  TIER_LABEL,
} from "../../utils";
import { StopOptions } from "../StopOptions";

interface Props {
  client: PriorityClient;
  choice: StopChoice | undefined;
  onToggle: () => void;
  onContactTypeChange: (contactType: VisitContactType) => void;
  onWeekdayChange: (weekday: number | null) => void;
}

/**
 * Um cliente da carteira: quem é, onde fica, por que está na lista e se já
 * tem dia marcado. Marcado, ganha as escolhas de como e quando.
 */
export function PriorityClientRow({
  client,
  choice,
  onToggle,
  onContactTypeChange,
  onWeekdayChange,
}: Props) {
  const checkboxId = useId();
  const reason = mainReason(client);
  const already = scheduledLabel(client.scheduled);
  const place = [client.neighborhood, client.cityLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={cn(
        "flex flex-col gap-8 px-16 py-12 transition-colors",
        choice ? "bg-(--amber-bg)" : "hover:bg-(--bg2)"
      )}
    >
      <div className="flex items-start gap-12">
        <InputCheckbox
          id={checkboxId}
          checked={Boolean(choice)}
          onChange={onToggle}
          aria-label={`Escolher ${client.name}`}
          className="mt-[2px]"
        />
        {/* A linha inteira marca o cliente, não só a caixinha: ela é pequena
            para quem tem a mão menos firme, e o nome é onde o olho está. */}
        <label
          htmlFor={checkboxId}
          className="flex min-w-0 flex-1 cursor-pointer flex-col gap-4"
        >
          <Title variant="body-sm" weight="medium">
            {client.name}
          </Title>
          <Title variant="body-xs" color="muted">
            {place}
          </Title>
          {reason && (
            <Title
              variant="body-xs"
              color="secondary"
              title={reason.reason.why}
            >
              {reason.reason.short} · {reason.factory}
            </Title>
          )}
        </label>
      </div>
      {/* Tags, visita × contato e dia numa linha só: empilhados, cada
          cliente escolhido virava três linhas. */}
      <div className="flex flex-wrap items-center gap-6 pl-[28px]">
        <Badge.Root
          color={TIER_COLOR[client.tier]}
          appearance="tinted"
          title={TIER_HINT[client.tier]}
        >
          <Badge.Text>{TIER_LABEL[client.tier]}</Badge.Text>
        </Badge.Root>
        {client.isForced && (
          <Badge.Root
            color="blue"
            appearance="tinted"
            title="O cliente pediu visita num contato anterior."
          >
            <Badge.Text>Pediu visita</Badge.Text>
          </Badge.Root>
        )}
        {client.availableFrom && (
          <Badge.Root
            color="neutral"
            appearance="tinted"
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
    </div>
  );
}
