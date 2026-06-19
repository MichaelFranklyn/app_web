import React from "react";
import { alertRootStyles } from "./style";

export interface AlertRootProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof alertRootStyles.variants;
}
