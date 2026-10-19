"use client";

import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import {
  ButtonHTMLAttributes,
  DragEvent,
  forwardRef,
  ReactNode,
  useState,
} from "react";

/**
 * A folhinha: uma grade de dias, como a do Google Agenda — na semana, sete
 * colunas lado a lado; no mês, as semanas umas sobre as outras.
 *
 * Só desenho. O que vai dentro de cada dia (os compromissos, o "+ Agendar")
 * é da tela que usa.
 */

interface RootProps {
  /**
   * `week`: sete colunas no desktop; abaixo dele os dias se empilham (sete
   * colunas não cabem numa tela de celular, e rolar de lado esconde o dia).
   * `month`: sempre sete colunas, células baixas.
   */
  variant: "week" | "month";
  children: ReactNode;
  className?: string;
}

/** As linhas entre os dias são o fundo aparecendo pelo `gap` de 1px. */
const Root = ({ variant, children, className }: RootProps) => (
  <div
    className={cn(
      "grid gap-px overflow-hidden rounded-(--r-md) border border-(--border) bg-(--border)",
      variant === "week" ? "desktop:grid-cols-7 grid-cols-1" : "grid-cols-7",
      className
    )}
  >
    {children}
  </div>
);

/** A faixa "SEG TER QUA…" sobre o mês (na semana, o dia diz o próprio nome). */
const Weekdays = ({ labels }: { labels: string[] }) => (
  <>
    {labels.map((label) => (
      <div key={label} className="bg-(--bg2) px-8 py-6 text-center">
        <Title variant="micro" color="muted" weight="semibold">
          {label}
        </Title>
      </div>
    ))}
  </>
);

interface CellProps {
  /** Dia de fora do mês exibido: esmaecido, como na folhinha. */
  isOutside?: boolean;
  /** Dia que a pessoa não trabalha: fundo apagado. */
  isOff?: boolean;
  variant: "week" | "month";
  /**
   * Aceita soltar o que foi arrastado com este tipo (`dataTransfer`). Ausente
   * = o dia não recebe nada (passado, folga). A célula acende enquanto algo
   * desse tipo passa por cima.
   */
  dropType?: string;
  onDropData?: (data: string) => void;
  children: ReactNode;
  className?: string;
}

const Cell = ({
  isOutside,
  isOff,
  variant,
  dropType,
  onDropData,
  children,
  className,
}: CellProps) => {
  const [isOver, setIsOver] = useState(false);
  const accepts = (e: DragEvent) =>
    Boolean(dropType && onDropData && e.dataTransfer.types.includes(dropType));

  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col bg-(--bg2) transition-colors",
        variant === "week"
          ? "desktop:min-h-[420px]"
          : "tablet:min-h-[112px] min-h-[64px]",
        (isOutside || isOff) && "bg-(--bg)",
        isOutside && "opacity-60",
        isOver && "bg-(--bg3) ring-2 ring-(--amber) ring-inset",
        className
      )}
      onDragOver={(e) => {
        if (!accepts(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!isOver) setIsOver(true);
      }}
      onDragLeave={(e) => {
        // Passar por cima de um card de dentro também dispara o "leave".
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsOver(false);
        }
      }}
      onDrop={(e) => {
        setIsOver(false);
        if (!accepts(e) || !dropType) return;
        e.preventDefault();
        onDropData?.(e.dataTransfer.getData(dropType));
      }}
    >
      {children}
    </div>
  );
};

interface CellHeaderProps {
  /** "SEG" — só na semana; no mês a faixa de cima já diz. */
  weekday?: string;
  day: number;
  isToday?: boolean;
  /** O número do dia abre o dia, como no Google. */
  onOpen?: () => void;
  openLabel?: string;
  /** À direita: "Não trabalha", contagem… */
  aside?: ReactNode;
  /** O clique no vazio cai na `CellHitArea` de baixo; só o número responde. */
  passThrough?: boolean;
}

const CellHeader = ({
  weekday,
  day,
  isToday,
  onOpen,
  openLabel,
  aside,
  passThrough,
}: CellHeaderProps) => {
  const number = (
    <span
      className={cn(
        "inline-flex h-[28px] min-w-[28px] items-center justify-center rounded-full px-4",
        isToday && "bg-(--amber)"
      )}
    >
      <Title
        as="span"
        variant="heading-sm"
        color={isToday ? "inverse" : "default"}
      >
        {day}
      </Title>
    </span>
  );

  return (
    <div
      className={cn(
        "relative flex items-center justify-between gap-6 px-8 pt-8 pb-4",
        passThrough && "pointer-events-none"
      )}
    >
      <div className="flex items-center gap-6">
        {weekday && (
          <Title
            variant="micro"
            weight="semibold"
            color={isToday ? "amber" : "muted"}
          >
            {weekday}
          </Title>
        )}
        {onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            title={openLabel}
            aria-label={openLabel}
            className="pointer-events-auto rounded-full transition-colors hover:bg-(--bg4) focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber)"
          >
            {number}
          </button>
        ) : (
          number
        )}
      </div>
      {aside}
    </div>
  );
};

interface CellBodyProps {
  /**
   * O clique no vazio cai na `CellHitArea` de baixo. Quem usa marca o que
   * responde ao clique com `pointer-events-auto` — explícito, e não num
   * seletor de filhos, que reativaria o fundo de um painel fechado ali dentro.
   */
  passThrough?: boolean;
  children: ReactNode;
}

/** Os compromissos do dia, em coluna. */
const CellBody = ({ passThrough, children }: CellBodyProps) => (
  <div
    className={cn(
      "relative flex min-w-0 flex-1 flex-col gap-4 px-6 pb-6",
      passThrough && "pointer-events-none"
    )}
  >
    {children}
  </div>
);

/**
 * A célula inteira clicável, por baixo dos compromissos — clicar no vazio de
 * um dia, como no Google Agenda. Vem antes do cabeçalho e do corpo, que então
 * usam `passThrough`. Repassa a ref e as props para servir de gatilho de menu
 * (`asChild`).
 */
const CellHitArea = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
>(({ label, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    title={label}
    aria-label={label}
    className={cn(
      "absolute inset-0 cursor-pointer transition-colors hover:bg-(--bg3)/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-(--amber) focus-visible:ring-inset",
      className
    )}
    {...props}
  />
));
CellHitArea.displayName = "Calendar.CellHitArea";

/** O pé do dia: "+ Agendar". */
const CellFooter = ({ children }: { children: ReactNode }) => (
  <div className="relative flex flex-col gap-4 px-6 pb-8">{children}</div>
);

export const Calendar = {
  Root,
  Weekdays,
  Cell,
  CellHeader,
  CellBody,
  CellHitArea,
  CellFooter,
};
