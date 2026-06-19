import React from "react";

export interface SidebarBottomProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  role?: string;
  initials?: string;
  src?: string;
}
