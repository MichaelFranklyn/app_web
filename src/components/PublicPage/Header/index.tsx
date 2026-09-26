import { cn } from "@/lib/utils";
import React from "react";
import { PUBLIC_PAGE_CONTAINER } from "../style";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Faixa em `--bg2`, destacada do corpo (o portal do cliente). */
  raised?: boolean;
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, children, raised = false, ...props }, ref) => (
    <header
      ref={ref}
      className={cn("border-b border-(--border)", raised && "bg-(--bg2)")}
      {...props}
    >
      <div
        className={cn(
          PUBLIC_PAGE_CONTAINER,
          "flex flex-col gap-[16px] py-[20px]",
          className
        )}
      >
        {children}
      </div>
    </header>
  )
);

Header.displayName = "PublicPage.Header";
