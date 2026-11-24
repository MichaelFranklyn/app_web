import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";
import { ICON_SIZE } from "@/components/Icon";

const TONES = {
  red: "bg-(--color-status-danger)",
  purple: "bg-(--purple)",
  blue: "bg-(--color-status-info)",
} as const;

interface BannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * red: condição que impede o trabalho (offline); purple: sessão emprestada;
   * blue: trabalho guardado no aparelho esperando o sinal (informa, não trava).
   */
  tone: keyof typeof TONES;
  icon: LucideIcon;
  /** Ação à direita (ex.: "Voltar ao console"). */
  action?: React.ReactNode;
}

/**
 * Faixa de largura total no topo do painel, acima da topbar: uma condição que
 * vale para a tela inteira enquanto durar. Texto em `Title color="inverse"`.
 *
 * QUANDO USAR: só condição GLOBAL do app (rede caiu, sessão emprestada, fila
 * offline). Aviso de um trecho → `Alert.Root`; retorno de ação → `useToast`.
 * Regras: PATTERNS/ds-usage-rules.md.
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
    // Aparece quando a condição começa (caiu a rede, sessão emprestada): sem
    // região viva, quem usa leitor de tela não fica sabendo. `status` não
    // interrompe; o chamador passa `role="alert"` quando a condição trava.
    role="status"
    className={cn(
      "flex flex-wrap items-center justify-between gap-8 px-16 py-8 text-(--color-on-action)",
      TONES[tone],
      className
    )}
    {...props}
  >
    <div className="flex min-w-0 items-center gap-8">
      <span className="grid size-[26px] shrink-0 place-items-center rounded-full bg-(--color-on-action)/20">
        <Icon size={ICON_SIZE.sm} aria-hidden />
      </span>
      {children}
    </div>
    {action}
  </div>
);
