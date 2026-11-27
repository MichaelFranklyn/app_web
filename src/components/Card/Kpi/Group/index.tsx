import { cn } from "@/lib/utils";
import { Grid } from "@/components/Grid";
import React from "react";
import { CardKpiGroupProps } from "./interface";
import { KPI_GROUP_LAST_ODD_SPAN, kpiGroupCols } from "./style";

/**
 * A faixa de números: toda fileira de `Card.Kpi` mora aqui. Colunas pela
 * quantidade, espaço de 12px e o último ímpar esticado no celular — a tela só
 * entrega os cartões.
 */
export const KpiGroup = React.forwardRef<HTMLDivElement, CardKpiGroupProps>(
  ({ children, size = "default", className, ...props }, ref) => {
    const items = React.Children.toArray(children);
    const odd = items.length > 1 && items.length % 2 === 1;

    return (
      <Grid.Root
        ref={ref}
        cols={kpiGroupCols(items.length)}
        gap={12}
        data-size={size}
        className={cn("group/kpi", className)}
        {...props}
      >
        {items.map((item, index) => (
          <Grid.Item
            key={React.isValidElement(item) ? (item.key ?? index) : index}
            span={
              odd && index === items.length - 1
                ? KPI_GROUP_LAST_ODD_SPAN
                : undefined
            }
          >
            {item}
          </Grid.Item>
        ))}
      </Grid.Root>
    );
  }
);

KpiGroup.displayName = "Card.Kpi.Group";
