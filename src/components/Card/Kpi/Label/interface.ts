import type { LucideIcon } from "lucide-react";
import React from "react";

export interface CardKpiLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Ícone do que o número conta, num quadrado azul à direita do rótulo. Faz a
   * fileira ser lida pelo desenho antes do texto (modernização, 18/11/2026).
   */
  icon?: LucideIcon;
}
