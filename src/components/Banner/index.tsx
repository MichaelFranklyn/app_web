import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

const TONES = {
  red: "bg-(--red)",
  purple: "bg-(--purple)",
} as const;

interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** red: condição que impede o trabalho (offline); purple: sessão emprestada. */
  tone: keyof typeof TONES;
  icon: LucideIcon;
  /** Ação à direita (ex.: "Voltar ao console"). */
  action?: React.ReactNode;
}

/**
 * Faixa de largura total no topo do painel, acima da topbar: uma condição que
 * vale para a tela inteira enquanto durar. Texto em `Title color="inverse"`.
 */
export const Banner = ({
  tone,
  icon: Icon,
  action,
  className,
  children,
  ...props
}: BannerProps) => (
  <div
    className={cn(
      "flex flex-wrap items-center justify-between gap-8 px-16 py-8 text-white",
      TONES[tone],
      className
    )}
    {...props}
  >
    <div className="flex min-w-0 items-center gap-8">
      <Icon size={16} className="shrink-0" aria-hidden />
      {children}
    </div>
    {action}
  </div>
);
