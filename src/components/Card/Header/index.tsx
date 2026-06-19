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

    return (
      <div
        ref={ref}
        className={cn(headerStyle, headerBgVariants[bg], className)}
        {...props}
      >
        <div className={headerContentStyle}>{content}</div>
        {actions.length > 0 && (
          <div className={headerActionsWrapperStyle}>{actions}</div>
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
});
