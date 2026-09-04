"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import {
  SUPPORT_STATUS_COLOR,
  SUPPORT_UPDATE_KIND_LABEL,
  SupportUpdate,
} from "@/utils/support";
import { MessageSquare } from "lucide-react";

import { statusChangeLabel } from "../../utils";

interface Props {
  updates: SupportUpdate[];
}

/**
 * A conversa inteira do caso, do começo ao fim.
 *
 * Ordem cronológica CRESCENTE, ao contrário de quase toda lista do sistema: aqui
 * se lê uma história, e história se lê do começo. O que aconteceu por último já
 * está no topo da tela (na fila e no cabeçalho), então nada se perde.
 */
export function CaseTimeline({ updates }: Props) {
  if (updates.length === 0) {
    return (
      <Card.Root>
        <EmptyState.Root>
          <EmptyState.Icon>
            <MessageSquare size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhum andamento ainda</EmptyState.Title>
          <EmptyState.Description>
            Registre cada conversa com o cliente e com a fábrica. É esse
            histórico que sustenta a cobrança depois.
          </EmptyState.Description>
        </EmptyState.Root>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <div className="flex flex-col gap-16">
        <Title variant="heading-sm">O que já foi feito</Title>

        <ol className="flex flex-col gap-16">
          {updates.map((update) => {
            const change = statusChangeLabel(
              update.statusFrom,
              update.statusTo
            );
            return (
              <li
                key={update.id}
                className="border-l-2 border-(--border) pl-12"
              >
                <div className="flex flex-wrap items-center gap-8">
                  <Title variant="body-xs" weight="semibold">
                    {update.author?.name ?? "Sistema"}
                  </Title>
                  <Title variant="micro" color="muted">
                    {formatDate(update.createdAt)}
                  </Title>
                  {change && update.statusTo ? (
                    <Badge.Root
                      color={SUPPORT_STATUS_COLOR[update.statusTo]}
                      appearance="tinted"
                      size="xs"
                    >
                      <Badge.Text>{change}</Badge.Text>
                    </Badge.Root>
                  ) : (
                    <Badge.Root color="neutral" appearance="tinted" size="xs">
                      <Badge.Text>
                        {SUPPORT_UPDATE_KIND_LABEL[update.kind]}
                      </Badge.Text>
                    </Badge.Root>
                  )}
                </div>
                <Title variant="body-sm" className="mt-4 whitespace-pre-line">
                  {update.body}
                </Title>
              </li>
            );
          })}
        </ol>
      </div>
    </Card.Root>
  );
}
