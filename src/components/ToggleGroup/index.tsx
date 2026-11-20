"use client";

import { Button, ButtonSize } from "@/components/Button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface ToggleOption<T extends string | number> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Nome completo para leitor de tela e tooltip, quando o rótulo é curto. */
  ariaLabel?: string;
}

interface ToggleGroupProps<T extends string | number> {
  options: ToggleOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  size?: ButtonSize;
  /** As opções dividem a largura toda (escolha dentro de modal). */
  fullWidth?: boolean;
  /**
   * Só abaixo do desktop: o grupo toma a linha e as opções a dividem — solto
   * numa barra, ele deixava sobra vazia ao lado. No desktop, largura natural.
   */
  fullWidthBelowDesktop?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "data-tour"?: string;
}

/**
 * Escolha de uma entre poucas opções sempre à vista (modo de exibição, ótica
 * dos valores, atalhos de resposta). A escolhida fica em âmbar tingido (o sólido é do botão de salvar); as
 * outras, em contorno. `aria-pressed` diz ao leitor de tela que é um
 * interruptor, não uma ação.
 */
export function ToggleGroup<T extends string | number>({
  options,
  value,
  onChange,
  size = "sm",
  fullWidth = false,
  fullWidthBelowDesktop = false,
  disabled = false,
  className,
  "aria-label": ariaLabel,
  "data-tour": dataTour,
}: ToggleGroupProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-tour={dataTour}
      className={cn(
        "flex flex-wrap items-center gap-4",
        fullWidthBelowDesktop && "max-desktop:w-full",
        className
      )}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Button.Root
            key={String(option.value)}
            type="button"
            appearance={active ? "tinted" : "outline"}
            color={active ? "amber" : "neutral"}
            size={size}
            disabled={disabled}
            aria-pressed={active}
            label={option.ariaLabel}
            // Numa coluna estreita (grade de duas no celular) o rótulo longo
            // trunca com "…" em vez de vazar do botão; o ariaLabel guarda o
            // nome completo.
            className={cn(
              "min-w-0",
              fullWidth && "flex-1",
              fullWidthBelowDesktop && "max-desktop:flex-1"
            )}
            onClick={() => onChange(option.value)}
          >
            {option.icon ? <Button.Icon icon={option.icon} /> : null}
            <Button.Title className="truncate">{option.label}</Button.Title>
          </Button.Root>
        );
      })}
    </div>
  );
}
