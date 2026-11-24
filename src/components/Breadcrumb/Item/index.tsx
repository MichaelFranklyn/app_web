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
  // Item cortado com "…" (nome longo de atendimento, cliente) mostra o texto
  // inteiro na dica do navegador.
  const title =
    typeof children === "string" && /(^|\s)truncate/.test(className ?? "")
      ? children
      : undefined;

  if (href && !active) {
    return (
      <Link href={href} className={combinedClasses} title={title} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      aria-current={active ? "page" : undefined}
      className={combinedClasses}
      title={title}
      {...props}
    >
      {children}
    </span>
  );
});

BreadcrumbItem.displayName = "Breadcrumb.Item";
