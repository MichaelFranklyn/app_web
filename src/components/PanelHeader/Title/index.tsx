import { Title as DSTitle } from "@/components/Title";
import React from "react";

/**
 * O `<h1>` da página. Cor de texto padrão: o âmbar é só do que se clica, e o
 * título não responde ao toque (Leva 12, 14/11/2026). A tipografia vem do
 * `Title` (`heading-lg`), não de tamanho escrito à mão.
 */
export const Title = React.forwardRef<
  HTMLHeadingElement,
  Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">
>(({ children, ...props }, ref) => (
  <DSTitle variant="heading-lg" as="h1" ref={ref} {...props}>
    {children}
  </DSTitle>
));

Title.displayName = "PanelHeader.Title";
