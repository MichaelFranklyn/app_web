import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import React from "react";

interface TriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onToggle"
> {
  open: boolean;
  onToggle: () => void;
  /**
   * `bar`: ocupa a faixa de um `Collapse.Header`, com respiro e realce no
   * hover. `plain`: só o conteúdo, para o gatilho que mora dentro de um card.
   */
  variant?: "plain" | "bar";
  size?: "sm" | "md";
}

/**
 * O botão que abre e fecha um bloco: a seta aponta para o lado fechado e para
 * baixo aberto. `aria-expanded` vem junto — sem ele, o leitor de tela anuncia
 * um botão qualquer e não diz que há conteúdo escondido.
 */
const Trigger = ({
  open,
  onToggle,
  variant = "plain",
  size = "md",
  className,
  children,
  ...props
}: TriggerProps) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={open}
    className={cn(
      "flex min-w-0 cursor-pointer items-center text-left",
      size === "md" ? "gap-12" : "gap-6",
      variant === "bar" &&
        "flex-1 px-16 py-12 transition-colors hover:bg-(--bg2)",
      className
    )}
    {...props}
  >
    <ChevronDown
      size={size === "md" ? 18 : 14}
      aria-hidden
      className={cn(
        "shrink-0 text-(--muted) transition-transform",
        !open && "-rotate-90"
      )}
    />
    {children}
  </button>
);

/** Faixa de cabeçalho de um bloco que abre e fecha (o dia na lista da semana). */
const Header = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-stretch bg-(--bg3)", className)} {...props} />
);

export const Collapse = { Trigger, Header };
