"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { HeaderActions } from "../Actions";
import { CardHeaderRootProps } from "../interface";
import {
  headerActionsWrapperStyle,
  headerBgVariants,
  headerContentStyle,
  headerStyle,
} from "../style";
import { useHeaderActionsMode } from "../../../HeaderActions";

export const HeaderRoot = React.forwardRef<HTMLDivElement, CardHeaderRootProps>(
  ({ bg = "bg2", className, children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);

    const actions = childArray.filter(
      (child) =>
        React.isValidElement(child) &&
        (child.type as React.FC) === HeaderActions
    );

    const content = childArray.filter(
      (child) =>
        !React.isValidElement(child) ||
        (child.type as React.FC) !== HeaderActions
    );

    // Refs para medir espaço disponível vs. tamanho das ações em cada estágio.
    const innerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const actionsRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

    const mode = useHeaderActionsMode({
      headerRef: innerRef,
      contentRef,
      actionsRef,
      hasActions: actions.length > 0,
    });

    return (
      <div
        ref={innerRef}
        data-actions-mode={mode}
        className={cn(headerStyle, headerBgVariants[bg], className)}
        {...props}
      >
        <div ref={contentRef} className={headerContentStyle}>
          {content}
        </div>
        {actions.length > 0 && (
          <div ref={actionsRef} className={headerActionsWrapperStyle}>
            {actions}
          </div>
        )}
      </div>
    );
  }
);

HeaderRoot.displayName = "Card.Header";
