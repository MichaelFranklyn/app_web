import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { breadcrumbItemStyles } from "./style";

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLElement> {
  active?: boolean;
  href?: string;
}

export const BreadcrumbItem = React.forwardRef<
  HTMLElement,
  BreadcrumbItemProps
>(({ className, active, href, children, ...props }, ref) => {
  const combinedClasses = cn(
    breadcrumbItemStyles.base,
    active ? breadcrumbItemStyles.active : breadcrumbItemStyles.interactive,
    className
  );

  if (href && !active) {
    return (
      <Link href={href} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      aria-current={active ? "page" : undefined}
      className={combinedClasses}
      {...props}
    >
      {children}
    </span>
  );
});

BreadcrumbItem.displayName = "Breadcrumb.Item";
