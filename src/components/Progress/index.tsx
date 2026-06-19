import React from "react";
import { Bar } from "./Bar";
import { Header, Label } from "./Header";
import { Root } from "./Root";
import { ProgressProps } from "./Root/interface";
import { Value } from "./Value";

const _Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, color = "amber", className, ...props }, ref) => (
    <Root ref={ref} className={className} {...props}>
      <Bar value={value} color={color} />
    </Root>
  )
);

_Progress.displayName = "Progress";

export const Progress = Object.assign(_Progress, {
  Root,
  Header,
  Label,
  Value,
  Bar,
});
