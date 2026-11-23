"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { InputCheckbox } from "@/components/Input/InputCheckbox";
import { Title } from "@/components/Title";
import { TextButton } from "@/components/TextLink";
import { cn } from "@/lib/utils";
import { toTitleCase } from "@/utils/format/titleCase";
import {
  contactNoun,
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
} from "@/utils/visit";

import { useState } from "react";

import { CrossOfficeStop } from "../../interface";
import { OtherOfficeStopPanel } from "./OtherOfficeStopPanel";
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
  const [isOpen, setIsOpen] = useState(false);
  const isCompact = density === "compact";
  const isCompleted = stop.status === "COMPLETED";
  const isPending = stop.status === "PENDING";
  const isRemote = stop.contactType === "REMOTE";
  const noun = contactNoun(stop.contactType);
  // Como na parada daqui: sem endereço, o cartão diz — não some a linha.
  const place = placeLine(stop) || (isRemote ? "" : "Sem endereço");
  const clientName = toTitleCase(stop.clientName);
  const officeName = toTitleCase(stop.officeName);
  const checkLabel = isCompleted
    ? `Reabrir ${noun}`
    : `Marcar ${noun} como concluída`;

  const stopClick = (e: { stopPropagation: () => void }) => e.stopPropagation();

  return (
    <>
      {/* O painel fica fora do cartão: dentro dele, o clique no painel
        subiria pela árvore do React até o onClick do cartão. */}
      <OtherOfficeStopPanel
        stop={stop}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onToggleCompleted={(checked) => void toggleCompleted(checked)}
        onMarkAbsent={() => void markAbsent()}
        isSaving={isSaving}
      />
      <Card.Root
        inset
        tone="muted"
        interactive
        event={isRemote ? "blue" : "amber"}
        faded={!isPending}
        className="group/card"
        title={`Da sua rotina no ${officeName}`}
        // Como a parada daqui: o cartão inteiro abre o painel com o mouse ou o
        // dedo; para o teclado quem abre é o nome (um botão de verdade).
        onClick={() => setIsOpen(true)}
      >
        <Card.Body padding="sm">
          <div className="flex min-w-0 items-start gap-8">
            <div
              className="mt-1 shrink-0"
              onClick={stopClick}
              onKeyDown={stopClick}
            >
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
              {/* O nome primeiro, como no cartão daqui: é o que a pessoa procura
              na coluna. O escritório vira detalhe — a borda e a linha de baixo
              já dizem de onde a parada vem. */}
              <TextButton
                className="block"
                aria-label={`Visualizar ${noun}: ${clientName}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
              >
                <Title
                  variant={isCompact ? "body-xs" : "body-sm"}
                  weight="semibold"
                  color={isPending ? "default" : "muted"}
                  className={cn(
                    "block break-words",
                    isCompact && [
                      "line-clamp-2",
                      // Como o Jira: o nome longo fica em duas linhas e, com o
                      // mouse (ou o foco) no card, aparece inteiro — o card cresce
                      // para baixo e empurra os de baixo, sem sobrepor.
                      "group-focus-within/card:line-clamp-none group-hover/card:line-clamp-none",
                    ],
                    isCompleted && "line-through"
                  )}
                >
                  {clientName}
                </Title>
              </TextButton>
              {place && (
                <Title
                  variant={isCompact ? "micro" : "body-xs"}
                  color="muted"
                  className={cn(
                    "mt-2 block truncate",
                    isCompact &&
                      "group-focus-within/card:break-words group-focus-within/card:whitespace-normal group-hover/card:break-words group-hover/card:whitespace-normal"
                  )}
                  title={place}
                >
                  {place}
                </Title>
              )}
              <Title
                variant="micro"
                color="muted"
                className="mt-2 block break-words"
                title={`Pedido e estoque desta parada: entre no ${officeName}.`}
              >
                {[!isCompact && stop.factoryName, officeName]
                  .filter(Boolean)
                  .join(" · ")}
              </Title>
              {isRemote && (
                <div className="mt-6 flex flex-wrap gap-4">
                  <Badge.ContactType contactType={stop.contactType} />
                </div>
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
                <div className="mt-8" onClick={stopClick} onKeyDown={stopClick}>
                  <Button.Root
                    type="button"
                    appearance="outline"
                    color="neutral"
                    size="sm"
                    disabled={isSaving}
                    label={`Marcar que ${clientName} não estava`}
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
    </>
  );
}
