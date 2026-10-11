"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Timeline } from "@/components/Timeline";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import {
  FOLLOW_UP_EVENT_LABEL,
  FollowUpEvent,
  FollowUpEventKind,
  followUpEventText,
} from "@/utils/followUp";
import { ThemeColor } from "@/lib/theme";

interface Props {
  events: FollowUpEvent[];
}

const EVENT_COLOR: Record<FollowUpEventKind, ThemeColor> = {
  CREATED: "blue",
  RESCHEDULED: "amber",
  REASSIGNED: "neutral",
  EDITED: "neutral",
  DONE: "green",
  CANCELLED: "red",
};

/**
 * A história do contato, do agendamento ao fim — em ordem CRESCENTE, porque
 * aqui se lê uma história. É ela que mostra quantas vezes o contato foi
 * empurrado, e para quando.
 */
export function FollowUpTimeline({ events }: Props) {
  return (
    <Card.Root>
      <Card.Body padding="compact" className="gap-16">
        <Title variant="heading-sm">Histórico</Title>
        <Timeline.Root className="gap-16">
          {events.map((event) => {
            const detail = followUpEventText(event, (iso) => formatDate(iso));
            return (
              <Timeline.Item key={event.id}>
                <div className="flex flex-wrap items-center gap-8">
                  <Badge.Root
                    color={EVENT_COLOR[event.kind]}
                    appearance="tinted"
                    size="xs"
                  >
                    <Badge.Text>{FOLLOW_UP_EVENT_LABEL[event.kind]}</Badge.Text>
                  </Badge.Root>
                  <Title variant="body-xs" weight="semibold">
                    {event.author?.name ?? "Sistema"}
                  </Title>
                  <Title variant="micro" color="muted">
                    {formatDate(event.createdAt)}
                  </Title>
                </div>
                {detail && (
                  <Title variant="body-sm" className="mt-4">
                    {detail}
                  </Title>
                )}
                {event.note && (
                  <Title
                    variant="body-sm"
                    color="muted"
                    className="mt-4 whitespace-pre-line"
                  >
                    {event.note}
                  </Title>
                )}
              </Timeline.Item>
            );
          })}
        </Timeline.Root>
      </Card.Body>
    </Card.Root>
  );
}
