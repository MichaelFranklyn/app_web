import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import React from "react";

/**
 * Conteúdo de tooltip com mais de um bloco (o "?" dos gráficos, o score do
 * cliente): cabeçalho e seções separadas por traço. Vai no `content` do
 * `Tooltip` com `panel`, que tira o respiro da caixa para as seções irem de
 * borda a borda.
 */
const Root = ({
  width = 300,
  children,
}: {
  width?: 280 | 300;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "flex flex-col divide-y divide-(--border)",
      // 22px = margem da tela (20) + borda da caixa (2): no celular estreito o
      // painel encolhe em vez de vazar.
      width === 280
        ? "w-[min(280px,calc(100vw-22px))]"
        : "w-[min(300px,calc(100vw-22px))]"
    )}
  >
    {children}
  </div>
);

/** Título do painel, à esquerda, e um valor opcional à direita. */
const Header = ({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-8 px-12 py-10">
    {typeof children === "string" ? (
      <Title variant="label" weight="semibold">
        {children}
      </Title>
    ) : (
      children
    )}
    {aside}
  </div>
);

/** Um bloco do painel. `muted` destaca o que vem antes da explicação. */
const Section = ({
  muted = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { muted?: boolean }) => (
  <div
    className={cn(
      "flex flex-col gap-8 px-12 py-10",
      muted && "bg-(--bg3)",
      className
    )}
    {...props}
  />
);

/**
 * QUANDO USAR: conteúdo em seções dentro de `<Tooltip panel content={...}>` —
 * a composição de um número (KPI, score, total). Não é peça solta nem
 * substitui modal: se tiver ação, vira rota/tela. Regras:
 * PATTERNS/ds-usage-rules.md.
 */
export const TooltipPanel = { Root, Header, Section };
