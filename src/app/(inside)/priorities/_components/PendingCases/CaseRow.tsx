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
    <div className="flex flex-col gap-12">
      <div className="tablet:flex-row tablet:items-start tablet:justify-between tablet:gap-16 flex flex-col gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* A prioridade colada no nome: é dele que ela fala. Empilhada com
              o prazo, a coluna de status virava uma torre de três andares. */}
          <div className="flex flex-wrap items-center gap-8">
            <Title variant="body-sm" weight="semibold">
              {item.clientName}
            </Title>
            <Badge.Root
              color={PENDING_PRIORITY_COLOR[item.priority]}
              appearance="tinted"
              size="xs"
              title={priorityHint(item)}
            >
              <Badge.Text>{PENDING_PRIORITY_LABEL[item.priority]}</Badge.Text>
            </Badge.Root>
          </div>
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
        {/* No celular o prazo desce para uma linha própria: como coluna ao
            lado, ele espremia o texto numa faixa estreita. */}
        <div className="tablet:flex-col tablet:items-end tablet:gap-2 tablet:text-right flex shrink-0 flex-wrap items-baseline gap-8">
          <Title variant="body-xs" color={dueTone(item.daysLate)}>
            {dueLabel(item.daysLate)}
          </Title>
          {item.dueDate && (
            <Title variant="micro" color="muted">
              {formatDate(item.dueDate)}
            </Title>
          )}
        </div>
      </div>
      {/* As ações numa fileira só, embaixo do conteúdo (18/11/2026): numa
          coluna estreita à direita elas quebravam em alturas e larguras
          diferentes. */}
      <PendingActions item={item} onScheduleReturn={onScheduleReturn} />
    </div>
  );
}
