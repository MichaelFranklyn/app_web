"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";

import { PendingItem } from "../../interface";
import {
  clientDetail,
  dueLabel,
  dueTone,
  PENDING_PRIORITY_COLOR,
  PENDING_PRIORITY_LABEL,
  priorityHint,
  reasonText,
} from "../../utils";
import { PendingActions } from "../PendingActions";

interface Props {
  item: PendingItem;
  /** Gestor: mostra de quem é a pendência. */
  showSeller: boolean;
  onScheduleReturn: (item: PendingItem) => void;
}

/**
 * Uma pendência da lista aberta: de quem é, a conta que fez dela uma
 * pendência, a prioridade com o prazo e para onde ir resolver.
 *
 * O destino fica nos botões (escritos: "Abrir pedido", "Corrigir cadastro"),
 * e não na linha inteira: há mais de uma ação por pendência, e botão dentro de
 * link é HTML inválido.
 */
export function CaseRow({ item, showSeller, onScheduleReturn }: Props) {
  const who = [
    clientDetail(item),
    showSeller ? (item.sellerName ?? "sem responsável único") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="desktop:flex-row desktop:items-center desktop:gap-16 flex flex-col gap-8">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Title variant="body-sm" weight="semibold">
          {item.clientName}
        </Title>
        {who && (
          <Title variant="micro" color="muted">
            {who}
          </Title>
        )}
        {/* A explicação, sem abrir outra tela: a conta que fez disto uma
            pendência. */}
        <Title variant="body-xs" color="muted">
          {reasonText(item)}
        </Title>
      </div>
      <div className="desktop:w-[150px] desktop:flex-col desktop:items-end flex shrink-0 flex-wrap items-center gap-6">
        <Badge.Root
          color={PENDING_PRIORITY_COLOR[item.priority]}
          appearance="tinted"
          size="xs"
          title={priorityHint(item)}
        >
          <Badge.Text>{PENDING_PRIORITY_LABEL[item.priority]}</Badge.Text>
        </Badge.Root>
        <Title variant="body-xs" color={dueTone(item.daysLate)}>
          {dueLabel(item.daysLate)}
        </Title>
        {item.dueDate && (
          <Title variant="micro" color="muted">
            {formatDate(item.dueDate)}
          </Title>
        )}
      </div>
      <div className="desktop:w-[260px] desktop:justify-end flex shrink-0">
        <PendingActions item={item} onScheduleReturn={onScheduleReturn} />
      </div>
    </div>
  );
}
