"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Title } from "@/components/Title";

/**
 * Partes de um menu que é um painel (o sino de notificações): cabeçalho com
 * ação, linhas clicáveis e um rodapé que leva à tela completa. Vão dentro de
 * `Dropdown.Content` com `panel`.
 */

/** Título do painel à esquerda e uma ação curta à direita. */
export const PanelHeader = ({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between border-b border-(--border) px-12 py-10">
    <div className="flex items-center gap-8">{children}</div>
    {action}
  </div>
);

const ROW_TONE = {
  default: "",
  /** Ainda não lido: um fundo leve separa do que já foi visto. */
  unread: "bg-(--bg3)/40",
  /** Convite (ex.: ligar o push): âmbar, porque pede uma ação. */
  amber: "bg-(--amber-bg)/40 hover:bg-(--amber-bg)",
} as const;

interface PanelRowProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: keyof typeof ROW_TONE;
}

/** Uma linha clicável do painel; o traço entre linhas some na última. */
export const PanelRow = ({
  tone = "default",
  className,
  type = "button",
  ...props
}: PanelRowProps) => (
  <button
    type={type}
    className={cn(
      "flex items-start gap-10 border-b border-(--border) px-12 py-10 text-left transition-colors last:border-b-0 hover:bg-(--bg3)",
      "disabled:cursor-default disabled:opacity-60",
      ROW_TONE[tone],
      className
    )}
    {...props}
  />
);

/** "Ver tudo": o link para a tela completa, no pé do painel. */
export const PanelFooter = ({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center justify-center gap-6 border-t border-(--border) px-12 py-10 text-(--muted) transition-colors hover:bg-(--bg3) hover:text-(--text)"
  >
    <Title variant="micro" weight="semibold" className="text-inherit">
      {children}
    </Title>
    <ArrowRight size={12} aria-hidden />
  </Link>
);
