import { Avatar } from "@/components/Avatar";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import React from "react";
import { SidebarBottomProps } from "./interface";
import { sidebarBottomStyles } from "./style";

export const Bottom = React.forwardRef<HTMLDivElement, SidebarBottomProps>(
  ({ name, role, initials, src, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(sidebarBottomStyles.root, className)}
      {...props}
    >
      <Avatar
        size="sm"
        color="amber"
        initials={initials}
        src={src}
        alt={name}
      />
      <div className="flex min-w-0 flex-col">
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
