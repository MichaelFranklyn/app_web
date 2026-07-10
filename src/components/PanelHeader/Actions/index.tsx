"use client";

import { useHeaderActionsMode } from "@/components/HeaderActions";
import { cn } from "@/lib/utils";
import React from "react";
import { panelActionsStyle, panelActionsWrapperStyle } from "./style";

export const Actions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  // O externo dá a largura disponível; o interno é medido em cada estágio.
  const outerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => outerRef.current as HTMLDivElement);

  // Sem contentRef: as ações têm a linha inteira, não disputam com o título.
  const mode = useHeaderActionsMode({
    headerRef: outerRef,
    actionsRef: innerRef,
  });

  return (
    <div
      ref={outerRef}
      data-actions-mode={mode}
      className={cn(panelActionsWrapperStyle, className)}
      {...props}
    >
      <div ref={innerRef} className={panelActionsStyle}>
        {children}
      </div>
    </div>
  );
});

Actions.displayName = "PanelHeader.Actions";
