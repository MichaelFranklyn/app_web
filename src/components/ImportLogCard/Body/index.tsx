import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/Card";

export const Body = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card.Body ref={ref} className={cn(className)} {...props} />
));

Body.displayName = "ImportLogCard.Body";
