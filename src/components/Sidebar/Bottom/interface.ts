import React from "react";

export interface SidebarBottomProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  role?: string;
  initials?: string;
  src?: string;
  /** Recolhido: no desktop mostra só o avatar (nome/cargo escondidos). */
  collapsed?: boolean;
}
