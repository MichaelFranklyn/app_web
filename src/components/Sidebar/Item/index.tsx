import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { ICON_SIZE } from "@/components/Icon";

export interface SidebarItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  href?: string;
  color?:
    | "amber"
    | "blue"
    | "cyan"
    | "green"
    | "neutral"
    | "purple"
    | "red"
    | "yellow";
  icon?: React.ElementType;
  badge?: number | string;
  /** Recolhido: no desktop mostra só o ícone (rótulo escondido via CSS). */
  collapsed?: boolean;
}

const sidebarItemStyles = {
  item: cn(
    // Item é uma pílula recuada (mx 8 + px 12 = os mesmos 20px de antes até o
    // ícone), não uma faixa de ponta a ponta: o fundo do hover e do ativo
    // ganha canto e respiro, e a lista não parece uma tabela.
    "relative mx-8 flex items-center gap-8 rounded-(--r-md) px-12 py-7 text-body text-(--color-text-muted)",
    "cursor-pointer transition-colors duration-150 focus-ring",
    "hover:text-(--color-text) hover:bg-(--bg3)",
    // Barra do ativo: 3px colada à borda esquerda da pílula, presa no meio.
    "before:absolute before:top-[8px] before:bottom-[8px] before:left-0 before:w-[3px] before:rounded-full before:bg-(--amber) before:opacity-0 before:transition-opacity"
  ),
  active:
    "font-(--weight-semibold) text-(--color-action-text-on-tint) bg-(--amber-bg) before:opacity-100 hover:bg-(--amber-bg) hover:text-(--color-action-text-on-tint)",
  // No desktop recolhido, centraliza o ícone e remove o respiro horizontal.
  collapsed: "desktop:justify-center desktop:gap-0 desktop:px-0",
};

export const Item = React.forwardRef<HTMLAnchorElement, SidebarItemProps>(
  (
    {
      className,
      active,
      href,
      color,
      icon: Icon,
      badge,
      collapsed,
      children,
      title,
      ...props
    },
    ref
  ) => {
    const combinedClasses = cn(
      sidebarItemStyles.item,
      active && sidebarItemStyles.active,
      collapsed && sidebarItemStyles.collapsed,
      className
    );

    // Recolhido, o rótulo some do desktop: usa como tooltip nativo do ícone.
    const resolvedTitle =
      title ??
      (collapsed && typeof children === "string" ? children : undefined);

    const content = (
      <>
        {Icon ? (
          <Icon
            size={ICON_SIZE.md}
            strokeWidth={2}
            className={cn("shrink-0", color && `text-[var(--${color})]`)}
          />
        ) : (
          color && (
            <div
              className={cn(
                "h-[6px] w-[6px] shrink-0 rounded-full",
                `bg-[var(--${color})]`
              )}
            />
          )
        )}
        <span className={cn("truncate", collapsed && "desktop:hidden")}>
          {children}
        </span>
        {badge !== undefined && (
          <span
            className={cn(
              "text-body-sm ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-(--color-status-danger) px-5 font-bold text-(--color-on-action)",
              collapsed && "desktop:hidden"
            )}
          >
            {badge}
          </span>
        )}
      </>
    );

    if (href) {
      return (
        <Link
          ref={ref}
          href={href}
          className={combinedClasses}
          title={resolvedTitle}
          {...props}
        >
          {content}
        </Link>
      );
    }

    return (
      <a ref={ref} className={combinedClasses} title={resolvedTitle} {...props}>
        {content}
      </a>
    );
  }
);

Item.displayName = "Sidebar.Item";
