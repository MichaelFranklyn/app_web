import { Avatar } from "@/components/Avatar";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import React from "react";
import { SidebarBottomProps } from "./interface";
import { sidebarBottomStyles } from "./style";

export const Bottom = React.forwardRef<HTMLDivElement, SidebarBottomProps>(
  ({ name, role, initials, src, collapsed, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        sidebarBottomStyles.root,
        collapsed && "desktop:justify-center desktop:px-0",
        className
      )}
      title={collapsed ? name : undefined}
      {...props}
    >
      <Avatar
        size="sm"
        color="amber"
        initials={initials}
        src={src}
        alt={name}
      />
      <div
        className={cn("flex min-w-0 flex-col", collapsed && "desktop:hidden")}
      >
        <Title
          variant="body-sm"
          weight="semibold"
          className={sidebarBottomStyles.name}
        >
          {name}
        </Title>
        {role && (
          <Title
            variant="micro"
            color="muted"
            className={sidebarBottomStyles.role}
          >
            {role}
          </Title>
        )}
      </div>
    </div>
  )
);

Bottom.displayName = "Sidebar.Bottom";
