"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { InputCheckbox } from "@/components/Input/InputCheckbox";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import {
  contactNoun,
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
} from "@/utils/visit";

import { CrossOfficeStop } from "../../interface";
import { useOtherOfficeStop } from "./useOtherOfficeStop";

interface Props {
  stop: CrossOfficeStop;
  /** `compact` é o da semana em sete colunas. */
  density?: "full" | "compact";
  onChanged: () => void;
}

const placeLine = (stop: CrossOfficeStop): string =>
  [stop.neighborhood, [stop.city, stop.state].filter(Boolean).join(" - ")]
    .filter(Boolean)
    .join(", ");

/**
 * Uma parada da rotina da pessoa no OUTRO escritório, na agenda de cá. Dá para
 * concluir e marcar "Não estava" sem trocar de escritório; pedido e estoque
 * ficam no escritório dono da fábrica. Nada de preço, comissão ou percentual
 * da fábrica — só quem, onde e o estado.
 */
export function OtherOfficeStopCard({
  stop,
  density = "full",
  onChanged,
}: Props) {
  const { toggleCompleted, markAbsent, isSaving } = useOtherOfficeStop({
    stop,
    onChanged,
  });
  const isCompact = density === "compact";
  const isCompleted = stop.status === "COMPLETED";
  const isPending = stop.status === "PENDING";
  const isRemote = stop.contactType === "REMOTE";
  const noun = contactNoun(stop.contactType);
  const place = placeLine(stop);
  const checkLabel = isCompleted
    ? `Reabrir ${noun}`
    : `Marcar ${noun} como concluída`;

  return (
    <Card.Root
      inset
      tone="muted"
      event={isRemote ? "blue" : "amber"}
      faded={!isPending}
      title={`Da sua rotina no ${stop.officeName}`}
    >
      <Card.Body padding="sm">
        <div className="flex min-w-0 items-start gap-8">
          <div className="mt-1 shrink-0">
            <InputCheckbox
              tone="green"
              checked={isCompleted}
              disabled={isSaving || !(isPending || isCompleted)}
              onChange={(e) => toggleCompleted(e.target.checked)}
              title={checkLabel}
              aria-label={checkLabel}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-x-8 gap-y-2">
              <Badge.ContactType contactType={stop.contactType} />
              <Badge.Root
                color="purple"
                appearance="tinted"
                title={`Visita da sua rotina no ${stop.officeName}.`}
              >
                <Badge.Text>{stop.officeName}</Badge.Text>
              </Badge.Root>
            </div>
            <Title
              variant={isCompact ? "body-xs" : "value"}
              weight={isCompact ? "semibold" : undefined}
              color={isPending ? "default" : "muted"}
              className={cn(
                "block break-words",
                isCompact && "line-clamp-2",
                isCompleted && "line-through"
              )}
            >
              {stop.clientName}
            </Title>
            {place && (
              <Title
                variant={isCompact ? "micro" : "body-xs"}
                color="muted"
                className="mt-2 block truncate"
                title={place}
              >
                {place}
              </Title>
            )}
            {!isCompact && stop.factoryName && (
              <Title variant="micro" color="muted" className="mt-2 block">
                {stop.factoryName}
              </Title>
            )}
            {!isCompact && (
              <Title variant="micro" color="muted" className="mt-4 block">
                Pedido e estoque: entre no {stop.officeName}.
              </Title>
            )}
            {!isPending && (
              <div className="mt-6 flex flex-wrap gap-4">
                <Badge.Root
                  color={VISIT_STATUS_COLOR[stop.status]}
                  appearance="tinted"
                >
                  <Badge.Text>{VISIT_STATUS_LABEL[stop.status]}</Badge.Text>
                </Badge.Root>
              </div>
            )}
            {!isCompact && isPending && !isRemote && (
              <div className="mt-8">
                <Button.Root
                  type="button"
                  appearance="outline"
                  color="neutral"
                  size="sm"
                  disabled={isSaving}
                  label={`Marcar que ${stop.clientName} não estava`}
                  onClick={() => void markAbsent()}
                >
                  <Button.Title>Não estava</Button.Title>
                </Button.Root>
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
