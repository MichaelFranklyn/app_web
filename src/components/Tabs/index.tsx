"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { List, Item, Content } from "./List";
import { tabsStyles } from "./List/style";

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
    router.push(`${pathname}?${params.toString()}`);
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

const NavList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(tabsStyles.list, className)} {...props} />
  )
);
NavList.displayName = "Tabs.NavList";

type NavItemProps = Omit<React.ComponentPropsWithoutRef<typeof Link>, "href"> & {
  href: string;
};

const NavItem = ({ href, className, ...props }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      data-state={isActive ? "active" : "inactive"}
      className={cn(tabsStyles.item, className)}
      {...props}
    />
  );
};
NavItem.displayName = "Tabs.NavItem";

export const Tabs = {
  Root,
  List,
  Item,
  Content,
  NavList,
  NavItem,
};
