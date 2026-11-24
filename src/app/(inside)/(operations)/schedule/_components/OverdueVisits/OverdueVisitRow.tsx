"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { clientDisplayName } from "@/utils/client";
import { factoryName } from "@/utils/company";
import { CalendarClock, Check, Clock, UserX } from "lucide-react";

import { formatDayLabel, formatWeekdayLabel } from "../../utils";
import { OverdueOutcome, OverdueVisit } from "./interface";

interface Props {
  visit: OverdueVisit;
  /** O gestor só lê a fila: sem os desfechos, que para ele não fariam nada. */
  canAnswer: boolean;
  isAnswering: boolean;
  onAnswer: (outcome: OverdueOutcome) => void;
  onReschedule: () => void;
}

/** A linha do lugar, como no cartão da visita: bairro, cidade - UF. */
const placeLine = (visit: OverdueVisit): string => {
  const client = visit.clientFactoryLink?.client;
  if (!client) return "";
  return [
    client.addressNeighborhood,
    [client.addressCity, client.addressState].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(", ");
};

/**
 * Uma visita sem resposta no painel lateral — no mesmo molde do cartão da
 * visita na agenda (pedido de 23/11/2026): fundo claro, borda esquerda na cor
 * do tipo (âmbar visita, azul ligação), nome, fábrica e lugar. O que muda é a
 * linha do dia planejado e os desfechos embaixo.
 */
export function OverdueVisitRow({
  visit,
  canAnswer,
  isAnswering,
  onAnswer,
  onReschedule,
}: Props) {
  const client = visit.clientFactoryLink?.client ?? null;
  const factory = visit.clientFactoryLink?.factory ?? null;
  const clientName = clientDisplayName(client, "Cliente");
  const isRemote = visit.contactType === "REMOTE";
  const date = visit.day?.date ?? null;
  const place = placeLine(visit);

  return (
    // `min-w-0` no card e em cada bloco de texto: sem isso, razão social longa
    // (sem espaço para quebrar) estica o card e estoura o painel para os lados.
    <Card.Root
      inset
      tone="muted"
      event={isRemote ? "blue" : "amber"}
      className="min-w-0"
    >
      <Card.Body padding="sm" className="min-w-0">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Nome completo em até duas linhas, não reticências: o vendedor
            reconhece o cliente pela razão social inteira, e ela é o que
            diferencia duas lojas da mesma rede. */}
          <Title
            variant="body-sm"
            weight="semibold"
            className="line-clamp-2 break-words"
            title={clientName}
          >
            {clientName}
          </Title>
          {factory && (
            <Title
              variant="body-xs"
              color="muted"
              className="block truncate"
              title={factoryName(factory)}
            >
              {factoryName(factory)}
            </Title>
          )}
          {!isRemote && (
            <Title
              variant="body-xs"
              color="muted"
              className="block truncate"
              title={place || "Sem endereço"}
            >
              {place || "Sem endereço"}
            </Title>
          )}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {isRemote && <Badge.ContactType contactType={visit.contactType} />}
            {date && (
              <Title variant="micro" color="muted">
                {/* "sexta · 31 Jul" — o vendedor reconhece o dia pelo nome,
                  não pela data solta. */}
                {formatWeekdayLabel(date)} · {formatDayLabel(date)}
              </Title>
            )}
          </div>
        </div>

        {/* Duas colunas iguais: os desfechos ficam do mesmo tamanho, sem uma
          linha órfã de botão quando o texto de um deles é mais longo. */}
        {canAnswer && (
          <div className="grid grid-cols-2 gap-6">
            <Button.Root
              appearance="solid"
              color="amber"
              size="sm"
              fullWidth
              loading={isAnswering}
              onClick={() => onAnswer("COMPLETED")}
            >
              <Button.Icon icon={Check} />
              <Button.Title>{isRemote ? "Falei" : "Fui"}</Button.Title>
            </Button.Root>
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              fullWidth
              disabled={isAnswering}
              onClick={() => onAnswer("CLIENT_ABSENT")}
            >
              <Button.Icon icon={UserX} />
              <Button.Title>
                {isRemote ? "Não atendeu" : "Não estava"}
              </Button.Title>
            </Button.Root>
            <Button.Root
              appearance="outline"
              color="neutral"
              size="sm"
              fullWidth
              disabled={isAnswering}
              onClick={() => onAnswer("NO_TIME")}
            >
              <Button.Icon icon={Clock} />
              <Button.Title>Não deu tempo</Button.Title>
            </Button.Root>
            <Button.Root
              appearance="ghost"
              color="neutral"
              size="sm"
              fullWidth
              disabled={isAnswering}
              onClick={onReschedule}
            >
              <Button.Icon icon={CalendarClock} />
              <Button.Title>Remarcar</Button.Title>
            </Button.Root>
          </div>
        )}
      </Card.Body>
    </Card.Root>
  );
}
