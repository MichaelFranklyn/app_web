import React from "react";

export interface CardKpiDeltaProps extends React.HTMLAttributes<HTMLDivElement> {
  positive?: boolean;
  negative?: boolean;
}
