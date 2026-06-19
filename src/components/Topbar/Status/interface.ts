import React from "react";

export type TopbarStatusVariant = "online" | "offline" | "warning";

export interface TopbarStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  variant?: TopbarStatusVariant;
}
