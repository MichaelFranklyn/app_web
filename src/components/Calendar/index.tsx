"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { plural } from "@/utils/format/plural";
import { FoldHorizontal, UnfoldHorizontal } from "lucide-react";
import {
  ButtonHTMLAttributes,
  CSSProperties,
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
  /**
   * Só na semana, no desktop: quais colunas estão recolhidas (uma por dia, na
   * ordem). A recolhida vira uma faixa estreita e as outras dividem o resto.
   */
  collapsed?: boolean[];
  children: ReactNode;
  className?: string;
}

/** Largura da coluna recolhida: cabe o número do dia e o botão de abrir. */
const COLLAPSED_COLUMN = "56px";

/** As linhas entre os dias são o fundo aparecendo pelo `gap` de 1px. */
const Root = ({ variant, collapsed, children, className }: RootProps) => {
  const hasCollapsed = variant === "week" && collapsed?.some(Boolean);
  const style = hasCollapsed
    ? ({
        "--week-cols": collapsed!
          .map((isCollapsed) =>
            isCollapsed ? COLLAPSED_COLUMN : "minmax(0,1fr)"
          )
          .join(" "),
      } as CSSProperties)
    : undefined;

  return (
    <div
      style={style}
      className={cn(
        "grid gap-px overflow-hidden rounded-(--r-md) border border-(--border) bg-(--border)",
        variant === "week"
          ? hasCollapsed
            ? "desktop:grid-cols-(--week-cols) grid-cols-1"
            : "desktop:grid-cols-7 grid-cols-1"
          : "grid-cols-7",
        className
      )}
    >
      {children}
    </div>
  );
};

/** A faixa "Seg Ter Qua…" sobre o mês (na semana, o dia diz o próprio nome). */
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
  /**
   * Dia de fora do mês exibido: fundo apagado e o número em cinza. Sem
   * `opacity` — ela apagava também os compromissos, que são reais e legíveis.
   */
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
      data-outside={isOutside || undefined}
      className={cn(
        "group/cell relative flex min-w-0 flex-col bg-(--bg2) transition-colors",
        variant === "week"
          ? "desktop:min-h-[420px]"
          : "tablet:min-h-[112px] min-h-[64px]",
        (isOutside || isOff) && "bg-(--bg)",
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
  /** "Seg" — só na semana; no mês a faixa de cima já diz. */
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
  /**
   * Recolher a coluna do dia (só na semana, só no desktop), como a coluna do
   * Jira: o botão aparece com o mouse sobre o dia e, recolhida, a coluna mostra
   * só o dia, a contagem e o botão de abrir.
   */
  collapse?: {
    isCollapsed: boolean;
    onToggle: () => void;
    /** Quantos compromissos o dia tem — o que a coluna recolhida ainda diz. */
    count?: number;
  };
}

const CellHeader = ({
  weekday,
  day,
  isToday,
  onOpen,
  openLabel,
  aside,
  passThrough,
  collapse,
}: CellHeaderProps) => {
  const number = (
    <span
      className={cn(
        "inline-flex h-[28px] min-w-[28px] items-center justify-center rounded-full px-4",
        // Fundo de ação (a cor da logo) com o número em --color-on-action:
        // o branco dava 3,21:1 sobre o #c97f0a (18/11/2026).
        isToday && "bg-(--color-action)"
      )}
    >
      <Title
        as="span"
        variant="heading-sm"
        color={isToday ? "onAction" : "default"}
        className={cn(
          !isToday && "group-data-outside/cell:text-(--color-text-muted)"
        )}
      >
        {day}
      </Title>
    </span>
  );

  const dayControl = onOpen ? (
    <button
      type="button"
      onClick={onOpen}
      title={openLabel}
      aria-label={openLabel}
      className="focus-ring pointer-events-auto rounded-full transition-colors hover:bg-(--bg4)"
    >
      {number}
    </button>
  ) : (
    number
  );

  const isCollapsed = Boolean(collapse?.isCollapsed);
  const toggle = collapse && (
    <Button.Root
      type="button"
      appearance="ghost"
      color="neutral"
      size="xs"
      isIconOnly
      label={isCollapsed ? "Abrir a coluna do dia" : "Recolher a coluna do dia"}
      onClick={collapse.onToggle}
      className={cn(
        "desktop:inline-flex pointer-events-auto hidden",
        // Aberta, só aparece com o mouse no dia (ou com o foco nele), como no
        // Jira; recolhida, fica sempre à vista — é o único jeito de voltar.
        !isCollapsed &&
          "desktop:opacity-0 desktop:group-hover/cell:opacity-100 desktop:focus-visible:opacity-100"
      )}
    >
      <Button.Icon icon={isCollapsed ? UnfoldHorizontal : FoldHorizontal} />
    </Button.Root>
  );

  if (isCollapsed) {
    return (
      <>
        {/* Abaixo do desktop a coluna não recolhe (os dias se empilham): o
          cabeçalho de sempre continua valendo ali. */}
        <div className="desktop:flex hidden flex-col items-center gap-6 px-4 pt-8 pb-4">
          {weekday && (
            <Title
              variant="micro"
              weight="semibold"
              color={isToday ? "amber" : "muted"}
            >
              {weekday}
            </Title>
          )}
          {dayControl}
          {toggle}
          {Boolean(collapse?.count) && (
            <Title
              variant="micro"
              weight="semibold"
              color="muted"
              title={`${plural(collapse?.count ?? 0, "compromisso", "compromissos")} neste dia`}
            >
              {collapse!.count}
            </Title>
          )}
        </div>
        <div className="desktop:hidden">
          <CellHeader
            weekday={weekday}
            day={day}
            isToday={isToday}
            onOpen={onOpen}
            openLabel={openLabel}
            aside={aside}
            passThrough={passThrough}
          />
        </div>
      </>
    );
  }

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
        {dayControl}
      </div>
      <div className="flex items-center gap-4">
        {aside}
        {toggle}
      </div>
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
  /** Coluna recolhida (desktop): o corpo some; abaixo do desktop, fica. */
  isCollapsed?: boolean;
  children: ReactNode;
}

/** Os compromissos do dia, em coluna. */
const CellBody = ({ passThrough, isCollapsed, children }: CellBodyProps) => (
  <div
    className={cn(
      "relative flex min-w-0 flex-1 flex-col gap-4 px-6 pb-6",
      passThrough && "pointer-events-none",
      isCollapsed && "desktop:hidden"
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
      "focus-ring-inset absolute inset-0 cursor-pointer transition-colors hover:bg-(--bg3)/60",
      className
    )}
    {...props}
  />
));
CellHitArea.displayName = "Calendar.CellHitArea";

/** O pé do dia: "+ Agendar". Some com a coluna recolhida (desktop). */
const CellFooter = ({
  isCollapsed,
  children,
}: {
  isCollapsed?: boolean;
  children: ReactNode;
}) => (
  <div
    className={cn(
      "relative flex flex-col gap-4 px-6 pb-8",
      isCollapsed && "desktop:hidden"
    )}
  >
    {children}
  </div>
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
