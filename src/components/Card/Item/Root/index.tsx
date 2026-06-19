import { cn } from "@/lib/utils";
import React from "react";
import { ItemActions } from "../Actions";
import { ItemLabel } from "../Label";
import { ItemValue } from "../Value";
import { CardItemRootProps } from "./interface";
import { itemStyle } from "./style";

export const ItemRoot = React.forwardRef<HTMLDivElement, CardItemRootProps>(
  (
    {
      variant,
      size,
      bordered = true,
      label,
      value,
      color,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        itemStyle({ variant, size }),
        bordered && "border-b border-(--border) last:border-b-0",
        className
      )}
      {...props}
    >
      {children !== undefined ? (
        children
      ) : (
        <>
          {label !== undefined && <ItemLabel>{label}</ItemLabel>}
          {value !== undefined && (
            <ItemActions>
              <ItemValue color={color}>{value}</ItemValue>
            </ItemActions>
          )}
        </>
      )}
    </div>
  )
);

ItemRoot.displayName = "Card.Item";
