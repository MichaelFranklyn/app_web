"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { announceNavigation } from "@/components/AppFrame/navigationSignal";
import { List, Item, Content } from "./List";
import { Filter, FilterItem } from "./Filter";
import { tabsStyles, TabsVariant } from "./List/style";
import { useScrollEdges } from "./useScrollEdges";

type RootProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
  urlParam?: string;
};

function Root({ urlParam, defaultValue, onValueChange, ...props }: RootProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!urlParam) {
    return (
      <TabsPrimitive.Root
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        {...props}
      />
    );
  }

  const activeTab = searchParams.get(urlParam) ?? defaultValue;

  const handleValueChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(urlParam, val);
    const href = `${pathname}?${params.toString()}`;
    announceNavigation(href);
    router.push(href);
    onValueChange?.(val);
  };

  return (
    <TabsPrimitive.Root
      value={activeTab}
      onValueChange={handleValueChange}
      {...props}
    />
  );
}

Root.displayName = "Tabs.Root";

const NavList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: TabsVariant }
>(({ className, variant = "line", ...props }, ref) => {
  const edgesRef = useScrollEdges(ref);
  return (
    <div
      ref={edgesRef}
      data-variant={variant}
      className={cn(
        tabsStyles.list,
        tabsStyles.listEdgeFade,
        variant === "filled" && tabsStyles.listFilled,
        className
      )}
      {...props}
    />
  );
});
NavList.displayName = "Tabs.NavList";

type NavItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  "href"
> & {
  href: string;
  /** Só ativa em match exato (útil quando o href é prefixo de outra aba). */
  exact?: boolean;
};

const NavItem = ({ href, exact, className, ...props }: NavItemProps) => {
  const pathname = usePathname();
  // O href pode levar querystring (uma aba que preserva o filtro da tela ao
  // navegar), e `pathname` nunca a tem: comparar a string inteira deixaria
  // TODAS as abas inativas.
  const target = href.split(/[?#]/)[0];
  const isActive = exact
    ? pathname === target
    : pathname === target || pathname.startsWith(`${target}/`);
  const ref = useRef<HTMLAnchorElement>(null);

  // A aba ativa pode estar fora da faixa (a 11ª dos relatórios, no celular).
  // Rola só a FAIXA, nunca a página: `scrollIntoView` mexeria na vertical.
  // Centraliza a ativa: as vizinhas dos dois lados ficam à vista e dizem que
  // a faixa continua. Encostada na borda, a aba seguinte sumia e não se via
  // que havia mais abas (crítica de /factories/[id], 23/11/2026). O navegador
  // limita o scrollLeft entre 0 e o fim, então a primeira e a última não
  // ficam com vão.
  useEffect(() => {
    const el = ref.current;
    const strip = el?.parentElement;
    if (!isActive || !el || !strip) return;
    if (strip.scrollWidth <= strip.clientWidth) return;
    const left = el.offsetLeft - strip.offsetLeft;
    strip.scrollLeft = left - (strip.clientWidth - el.offsetWidth) / 2;
  }, [isActive]);

  return (
    <Link
      ref={ref}
      href={href}
      data-state={isActive ? "active" : "inactive"}
      aria-current={isActive ? "page" : undefined}
      className={cn(tabsStyles.item, className)}
      {...props}
    />
  );
};
NavItem.displayName = "Tabs.NavItem";

export type { TabsVariant };

export const Tabs = {
  Root,
  List,
  Item,
  Content,
  NavList,
  NavItem,
  Filter,
  FilterItem,
};
