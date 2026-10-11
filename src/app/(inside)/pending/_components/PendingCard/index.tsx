"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";

import { PendingItem } from "../../interface";
import {
  clientDetail,
  dueLabel,
  dueTone,
  PENDING_PRIORITY_COLOR,
  PENDING_PRIORITY_LABEL,
  PENDING_TYPE_SINGULAR,
  priorityHint,
  reasonText,
} from "../../utils";
import { PendingActions } from "../PendingActions";

interface Props {
  item: PendingItem;
  showSeller: boolean;
  onScheduleReturn?: (item: PendingItem) => void;
}

/**
 * A pendência no celular: a mesma linha da tabela em cartão compacto. Prazo e
 * ação ficam sempre à vista — são o que a pessoa procura de pé, entre uma
 * visita e outra; o motivo vem logo abaixo, sem precisar abrir nada.
 */
export function PendingCard({ item, showSeller, onScheduleReturn }: Props) {
  const detail = clientDetail(item);
  const who = [
    item.clientName,
    detail,
    showSeller ? (item.sellerName ?? "sem responsável único") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-8">
        <div className="flex min-w-0 items-center gap-6">
          <Badge.Root
            color={PENDING_PRIORITY_COLOR[item.priority]}
            appearance="tinted"
            size="xs"
            title={priorityHint(item)}
          >
            <Badge.Text>{PENDING_PRIORITY_LABEL[item.priority]}</Badge.Text>
          </Badge.Root>
          <Title variant="body-sm" weight="semibold" className="truncate">
            {PENDING_TYPE_SINGULAR[item.type]}
          </Title>
        </div>
        <Title
          variant="body-xs"
          color={dueTone(item.daysLate)}
          className="shrink-0"
        >
          {dueLabel(item.daysLate)}
        </Title>
      </div>
      <Title variant="body-sm">{who}</Title>
      <Title variant="body-xs" color="muted">
        {reasonText(item)}
      </Title>
      <PendingActions item={item} onScheduleReturn={onScheduleReturn} />
    </div>
  );
}
