import { cn } from "@/lib/utils";
import React from "react";
import { CardKpiValueProps } from "./interface";
import { kpiValueStyle } from "./style";

/**
 * O `Intl` separa "R$" do número com espaço inquebrável. Num cartão estreito
 * (2 colunas a 360px) "R$ 223.084,01" não cabe numa linha e, sem ponto de quebra,
 * o `overflow-wrap:anywhere` partia o NÚMERO ("R$ 223.0/84,01"). Com espaço comum
 * a quebra cai entre a moeda e o valor; o `anywhere` segue como rede.
 */
const breakableCurrency = (children: React.ReactNode): React.ReactNode =>
  typeof children === "string"
    ? children.replace(/R\$\u00a0/g, "R$ ")
    : children;

export const KpiValue = React.forwardRef<HTMLDivElement, CardKpiValueProps>(
  ({ status, size, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(kpiValueStyle({ status, size }), className)}
      {...props}
    >
      {breakableCurrency(children)}
    </div>
  )
);

KpiValue.displayName = "Card.Kpi.Value";
