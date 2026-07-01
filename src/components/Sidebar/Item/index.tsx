import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

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
    "flex items-center gap-[8px] px-[20px] py-[7px] text-[14px] text-(--muted)",
    "border-l-[2px] border-transparent transition-all duration-120 cursor-pointer",
    "hover:text-(--text) hover:bg-(--bg3)"
  ),
  active:
    "font-(--weight-semibold) text-(--amber) border-l-(--amber) bg-(--amber-bg) hover:bg-(--amber-bg) hover:text-(--amber)",
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
            size={16}
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
              "ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-(--red) px-[5px] text-[13px] font-bold text-white",
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
