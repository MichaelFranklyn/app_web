"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef } from "react";

/**
 * Menu interno de uma área com várias telas (ex.: Configurações): a sidebar
 * leva à área com um item só, e é aqui que se escolhe a tela.
 *
 * No desktop é uma coluna, com os grupos nomeados — dá para ler a área
 * inteira de uma vez. No celular e no tablet vira uma faixa de abas que rola
 * de lado (os nomes de grupo somem: numa linha só eles não cabem nem ajudam).
 */
const Root = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <nav
    className={cn(
      "hide-scrollbar relative flex overflow-x-auto border-b border-(--border)",
      "desktop:flex-col desktop:gap-16 desktop:overflow-visible desktop:border-b-0",
      className
    )}
    {...props}
  />
);

interface GroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

const Group = ({ label, className, children, ...props }: GroupProps) => (
  <div
    role="group"
    aria-label={label}
    className={cn("desktop:flex desktop:flex-col contents", className)}
    {...props}
  >
    <span
      className={cn(
        "desktop:block hidden",
        "px-[12px] pb-[6px] text-[11px] font-(--weight-semibold) tracking-[0.06em] text-(--muted2) uppercase"
      )}
    >
      {label}
    </span>
    {children}
  </div>
);

interface ItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  "href"
> {
  href: string;
  icon?: React.ElementType;
  /** Fica ativo também nas telas de dentro (ex.: `/settings/users/[id]`). */
  matchPrefix?: string;
}

const Item = ({
  href,
  icon: Icon,
  matchPrefix,
  className,
  children,
  ...props
}: ItemProps) => {
  const pathname = usePathname();
  const base = matchPrefix ?? href;
  const isActive = pathname === base || pathname.startsWith(`${base}/`);
  const ref = useRef<HTMLAnchorElement>(null);

  // Na faixa do celular, a aba ativa pode nascer fora da tela (a 4ª de 5
  // aparecia cortada). Rola só a FAIXA, nunca a página: `scrollIntoView`
  // também moveria a tela na vertical.
  useEffect(() => {
    const el = ref.current;
    const strip = el?.closest("nav");
    if (!isActive || !el || !strip) return;
    if (strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollLeft = el.offsetLeft - 16;
  }, [isActive]);

  return (
    <Link
      ref={ref}
      href={href}
      aria-current={isActive ? "page" : undefined}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "flex shrink-0 items-center gap-[8px] whitespace-nowrap text-(--muted) transition-all duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-(--amber)",
        "hover:text-(--text)",
        // Celular/tablet: aba com traço embaixo.
        "mb-[-1px] border-b-[2px] border-transparent px-[16px] py-[10px] text-[13px]",
        "data-[state=active]:border-b-(--amber) data-[state=active]:font-(--weight-semibold) data-[state=active]:text-(--amber)",
        // Desktop: item de coluna com traço à esquerda, como a sidebar.
        "desktop:mb-0 desktop:rounded-r-[8px] desktop:border-b-0 desktop:border-l-[2px] desktop:px-[12px] desktop:py-[8px] desktop:text-[14px]",
        "desktop:hover:bg-(--bg3) desktop:data-[state=active]:border-l-(--amber) desktop:data-[state=active]:bg-(--amber-bg)",
        className
      )}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2} className="shrink-0" />}
      {children}
    </Link>
  );
};

export const SubNav = { Root, Group, Item };
