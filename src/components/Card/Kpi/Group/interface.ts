import React from "react";

export interface CardKpiGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Os cartões (`Card.Kpi` ou `Card.Kpi.Skeleton`). `null`/`false` não contam. */
  children: React.ReactNode;
  /**
   * `compact`: cartões baixos e número menor — para KPI que é RESUMO dentro de
   * um fluxo (o Conferir de uma importação, um modal), onde a faixa não pode
   * empurrar o que importa ali para baixo da dobra (27/11/2026). É da fileira,
   * nunca de cada cartão. Sai por CSS (`data-size` + `group/kpi`), sem
   * context: o `Card.Kpi` também roda em server component.
   */
  size?: "default" | "compact";
}
