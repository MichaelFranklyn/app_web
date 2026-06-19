import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import React from "react";
import { ImportLogCardRootProps } from "./interface";

export const Root = React.forwardRef<HTMLDivElement, ImportLogCardRootProps>(
  ({ className, ...props }, ref) => (
    <Card.Root ref={ref} className={cn(className)} {...props} />
  )
);

Root.displayName = "ImportLogCard.Root";
