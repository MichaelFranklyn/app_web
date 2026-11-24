import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";
import { ICON_SIZE } from "@/components/Icon";

const ICON_TONE = {
  /** Incluído, feito, ok. */
  success: "text-(--color-status-success)",
  /** Fora do alcance (recurso fora do plano). */
  disabled: "text-(--color-text-disabled)",
  muted: "text-(--color-text-muted)",
} as const;

interface RootProps extends React.HTMLAttributes<HTMLUListElement> {
  /**
   * `disc` (padrão): o marcador do navegador, para enumerar dentro de um texto.
   * `icon`: cada item traz o próprio ícone (checklist de recursos de um plano) —
   * sem recuo e com mais respiro entre as linhas.
   */
  marker?: "disc" | "icon";
}

/**
 * Lista com marcador, para enumerar dentro de um texto (as linhas que a
 * importação não conseguiu ler, por exemplo). Herda cor e tamanho do texto
 * em volta — dentro de um `Alert`, sai na cor do aviso.
 *
 * Com `marker="icon"` vira checklist: `BulletList.Item icon={Check}`.
 */
const Root = ({ marker = "disc", className, ...props }: RootProps) => (
  <ul
    className={cn(
      marker === "disc"
        ? "flex list-disc flex-col gap-2 pl-16"
        : "flex list-none flex-col gap-8",
      className
    )}
    {...props}
  />
);

interface ItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Ícone no lugar do marcador (use com `Root marker="icon"`). */
  icon?: LucideIcon;
  iconTone?: keyof typeof ICON_TONE;
}

const Item = ({
  icon: Icon,
  iconTone = "success",
  className,
  children,
  ...props
}: ItemProps) =>
  Icon ? (
    <li className={cn("flex items-start gap-8", className)} {...props}>
      <Icon
        aria-hidden
        size={ICON_SIZE.md}
        className={cn("mt-2 shrink-0", ICON_TONE[iconTone])}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  ) : (
    <li className={className} {...props}>
      {children}
    </li>
  );

export const BulletList = { Root, Item };
