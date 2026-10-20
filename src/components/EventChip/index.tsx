"use client";

import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { CircleCheck, LucideIcon } from "lucide-react";
import { DragEvent } from "react";

/** A cor do tipo de compromisso — é ela que se lê de relance na semana. */
export type EventChipTone = "amber" | "blue";

/**
 * Fundo branco e a BORDA ESQUERDA na cor do tipo: visita âmbar, ligação azul,
 * com o lado esquerdo quase reto, 3px (o `!` vence o `rounded-*` do card e do chip, que
 * no CSS gerado viria depois). O hover e o foco seguem a cor do tipo: a borda
 * inteira acende e o fundo ganha o tom claro dela.
 * O fundo colorido (7%, 20%, 70%) foi tentado e recusado — tingia a semana
 * inteira e brigava com o cinza do texto e as cores das etiquetas.
 */
export const EVENT_CHIP_STYLE: Record<EventChipTone, string> = {
  amber:
    "border border-l-5 border-l-(--amber) bg-(--bg2) rounded-l-[3px]! hover:border-(--amber) hover:bg-(--amber-bg) focus-visible:ring-(--amber)",
  blue: "border border-l-5 border-l-(--blue) bg-(--bg2) rounded-l-[3px]! hover:border-(--blue) hover:bg-(--blue-bg) focus-visible:ring-(--blue)",
};

const ICON: Record<EventChipTone, string> = {
  amber: "text-(--amber)",
  blue: "text-(--blue)",
};

interface Props {
  icon: LucideIcon;
  tone: EventChipTone;
  /** O que identifica o compromisso: o nome do cliente. */
  title: string;
  /** Uma linha de apoio (o motivo da ligação combinada, o desfecho). */
  detail?: string | null;
  /** Concluído: riscado, com o check verde no lugar do ícone. */
  isDone?: boolean;
  /** Teve outro desfecho (ausente, remarcado, cancelado): esmaecido. */
  isMuted?: boolean;
  /** `sm` é o do mês: uma linha só, sem o apoio. */
  size?: "md" | "sm";
  /** Texto do `title`/leitor de tela: o que o clique faz. */
  label: string;
  onClick: () => void;
  /** Arrastável para outro dia; o `onDragStart` diz o que vai junto. */
  onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
}

/**
 * Um compromisso numa linha, como na folhinha do Google Agenda: o fundo e o
 * ícone dizem o tipo, o texto diz com quem. O detalhe completo (e as ações)
 * fica no painel que o clique abre — a semana inteira precisa caber na tela.
 */
export function EventChip({
  icon: Icon,
  tone,
  title,
  detail,
  isDone = false,
  isMuted = false,
  size = "md",
  label,
  onClick,
  onDragStart,
}: Props) {
  const StatusIcon = isDone ? CircleCheck : Icon;

  return (
    <button
      type="button"
      onClick={onClick}
      draggable={Boolean(onDragStart)}
      onDragStart={onDragStart}
      title={label}
      aria-label={label}
      className={cn(
        "flex w-full min-w-0 items-start gap-6 rounded-(--r-sm) text-left transition-colors focus:outline-none focus-visible:ring-1",
        size === "sm" ? "px-6 py-2" : "px-8 py-6",
        EVENT_CHIP_STYLE[tone],
        (isDone || isMuted) && "opacity-70",
        onDragStart && "cursor-grab active:cursor-grabbing"
      )}
    >
      <StatusIcon
        size={size === "sm" ? 12 : 14}
        aria-hidden
        className={cn(
          "mt-[2px] shrink-0",
          isDone ? "text-(--green)" : ICON[tone]
        )}
      />
      <span className="flex min-w-0 flex-col">
        <Title
          as="span"
          variant={size === "sm" ? "micro" : "body-xs"}
          weight="semibold"
          color={isDone || isMuted ? "muted" : "default"}
          className={cn(
            size === "sm" ? "truncate" : "line-clamp-2 break-words",
            isDone && "line-through"
          )}
        >
          {title}
        </Title>
        {detail && size === "md" && (
          <Title as="span" variant="micro" color="muted" className="truncate">
            {detail}
          </Title>
        )}
      </span>
    </button>
  );
}
