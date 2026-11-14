import { cn } from "@/lib/utils";
import React from "react";

// Sem opacidade: a cor da variante já é o tom de texto com contraste medido
// sobre o tingido; o `opacity-80` antigo derrubava o azul para 3,36:1.
export const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-body-sm max-w-[90%] leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";
