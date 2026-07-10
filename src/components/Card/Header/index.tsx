"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { CardHeaderAction } from "./Action";
import { HeaderActions } from "./Actions";
import { HeaderDescription } from "./Description";
import { HeaderEyebrow } from "./Eyebrow";
import { CardHeaderRootProps } from "./interface";
import {
  headerActionsWrapperStyle,
  headerBgVariants,
  headerContentStyle,
  headerStyle,
} from "./style";
import { HeaderActionsGroup, useHeaderActionsMode } from "../../HeaderActions";
import { HeaderTitle } from "./Title";

const HeaderRoot = React.forwardRef<HTMLDivElement, CardHeaderRootProps>(
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

export const Header = Object.assign(HeaderRoot, {
  Eyebrow: HeaderEyebrow,
  Title: HeaderTitle,
  Description: HeaderDescription,
  Actions: HeaderActions,
  Action: CardHeaderAction,
  // Envolve vários headers (ex.: cards num grid) p/ decidirem o estágio juntos.
  Group: HeaderActionsGroup,
});
