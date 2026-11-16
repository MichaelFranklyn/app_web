import { IconTile } from "@/components/IconTile";
import { Title } from "@/components/Title";
import { ChevronRight, LucideIcon } from "lucide-react";
import React from "react";

interface OptionCardProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "title"
> {
  icon: LucideIcon;
  title: string;
  description?: string;
}

/**
 * Uma escolha grande e clicável: ícone, o que ela faz e uma linha explicando.
 * Alvo generoso, uma ação por linha — para a decisão tomada na hora, no
 * celular, como o próximo passo depois de concluir uma visita.
 */
export function OptionCard({
  icon: Icon,
  title,
  description,
  type = "button",
  ...props
}: OptionCardProps) {
  return (
    <button
      type={type}
      className="group focus-ring flex w-full cursor-pointer items-center gap-12 rounded-(--r-md) border border-(--border) bg-(--bg3) px-16 py-12 text-left transition-[background-color,border-color,box-shadow,scale] duration-150 hover:border-(--amber) hover:bg-(--bg2) hover:shadow-(--shadow-sm) active:scale-[0.99]"
      {...props}
    >
      <IconTile color="amber">
        <Icon />
      </IconTile>
      <span className="flex min-w-0 flex-1 flex-col">
        <Title variant="body-sm" weight="medium" as="span">
          {title}
        </Title>
        {description ? (
          <Title variant="body-xs" color="muted">
            {description}
          </Title>
        ) : null}
      </span>
      <ChevronRight
        size={16}
        aria-hidden
        className="shrink-0 text-(--color-text-muted) transition-[color,translate] duration-150 group-hover:translate-x-[2px] group-hover:text-(--color-action-text)"
      />
    </button>
  );
}
