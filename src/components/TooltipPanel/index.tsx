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
      width === 280 ? "w-[280px]" : "w-[300px]"
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
  <div className="flex items-center justify-between gap-8 px-[12px] py-[10px]">
    {typeof children === "string" ? (
      <Title variant="label">{children}</Title>
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
      "flex flex-col gap-8 px-[12px] py-[10px]",
      muted && "bg-(--bg3)",
      className
    )}
    {...props}
  />
);

export const TooltipPanel = { Root, Header, Section };
