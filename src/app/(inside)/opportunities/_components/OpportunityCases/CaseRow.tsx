"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { ArrowUpRight, CalendarCheck } from "lucide-react";
import Link from "next/link";

import { OpportunityCase } from "../../interface";
import { REASON_COPY, scheduledNote } from "../../utils";

interface Props {
  item: OpportunityCase;
  /** Sem rotina no plano não há visita a planejar. */
  canPlanVisits: boolean;
  onScheduleContact: (item: OpportunityCase) => void;
  onPlanVisit: (item: OpportunityCase) => void;
}

/**
 * Um cliente da oportunidade: o dado que o coloca ali, o motivo (quando o
 * sistema já o explica), o que JÁ está marcado e as duas ações comerciais.
 *
 * As ações ficam AO LADO do link da linha, nunca dentro: botão dentro de link
 * é HTML inválido, e o clique abriria a ficha junto.
 */
export function CaseRow({
  item,
  canPlanVisits,
  onScheduleContact,
  onPlanVisit,
}: Props) {
  const reason = item.reason ? REASON_COPY[item.reason] : null;
  const ReasonIcon = reason?.icon;
  const scheduled = scheduledNote(item);

  const body = (
    <>
      <div className="flex min-w-0 flex-col gap-2">
        <Title variant="body-sm" weight="semibold" className="truncate">
          {item.label}
        </Title>
        {item.detail && (
          <Title variant="micro" color="muted">
            {item.detail}
          </Title>
        )}
        {scheduled && (
          <Title
            variant="micro"
            color="green"
            className="flex items-center gap-4"
          >
            <CalendarCheck size={12} aria-hidden />
            {scheduled}
          </Title>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-8">
        {reason && ReasonIcon && (
          <Tooltip content={reason.hint}>
            <Badge.Root appearance="tinted" color="neutral" size="xs">
              <Badge.Icon>
                <ReasonIcon />
              </Badge.Icon>
              <Badge.Text>{reason.label}</Badge.Text>
            </Badge.Root>
          </Tooltip>
        )}
        {item.link && (
          <ArrowUpRight size={14} className="text-(--muted)" aria-hidden />
        )}
      </div>
    </>
  );

  const className =
    "flex items-center justify-between gap-12 rounded-(--r-sm) border border-transparent px-10 py-8 hover:border-(--border) hover:bg-(--bg3)";

  return (
    <li className="tablet:flex-row tablet:items-center flex flex-col gap-6">
      <div className="min-w-0 flex-1">
        {item.link ? (
          <Link href={item.link} className={`${className} transition-colors`}>
            {body}
          </Link>
        ) : (
          <div className={className}>{body}</div>
        )}
      </div>
      {item.clientId && (
        <div className="flex shrink-0 flex-wrap items-center gap-6 px-10">
          <Button.Root
            type="button"
            appearance="outline"
            color="neutral"
            size="xs"
            noUppercase
            onClick={() => onScheduleContact(item)}
          >
            <Button.Title>Agendar contato</Button.Title>
          </Button.Root>
          {canPlanVisits && (
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="xs"
              noUppercase
              onClick={() => onPlanVisit(item)}
            >
              <Button.Title>Planejar visita</Button.Title>
            </Button.Root>
          )}
        </div>
      )}
    </li>
  );
}
