import { ReactNode } from "react";

import { HelpTooltip } from "./index";

/**
 * Label de campo com o ícone de ajuda ao lado, em linguagem simples.
 *
 * @example
 * <Input.Text label={labelWithHelp("SKU", "Código do produto na fábrica.")} />
 */
export function labelWithHelp(text: string, help: ReactNode): ReactNode {
  return (
    <span className="inline-flex items-center gap-4">
      {text}
      <HelpTooltip label={`Ajuda: ${text}`} content={help} position="right" />
    </span>
  );
}
