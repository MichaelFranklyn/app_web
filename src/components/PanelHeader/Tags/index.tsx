import { cn } from "@/lib/utils";
import React from "react";

/**
 * A faixa das tarjas da página, abaixo da descrição — e, quando a tela tem
 * tarjas, as ações moram DENTRO dela, depois das tarjas (padrão de cabeçalho,
 * 23/11/2026):
 *
 *   <PanelHeader.Tags>
 *     <Badge.Root size="sm" …/>        ← tarjas primeiro, sempre `sm`
 *     <PanelHeader.Actions>…</PanelHeader.Actions>
 *   </PanelHeader.Tags>
 *
 * Tarja nunca vai dentro de `PanelHeader.Actions`: lá ela era medida como
 * botão, dividia a linha com eles no celular e mudava de lugar de tela para
 * tela. A tarja `sm` tem a altura do botão `sm`, então a faixa fica alinhada.
 *
 * No celular cada tarja ocupa a linha inteira e as ações descem para a linha
 * de baixo (uma tarja ou um botão por linha).
 */
export const Tags = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-panel-tags=""
    className={cn(
      "max-tablet:mt-16 mt-6 flex flex-wrap items-center gap-8",
      // Tarja (o Badge e quem embrulha um, como a ScoreTag) estica no celular.
      "max-tablet:[&>*:not([data-actions-mode])]:w-full",
      "max-tablet:[&>*:not([data-actions-mode])>[data-badge]]:w-full",
      // As ações dentro da faixa: sem margem própria, ocupam o resto da linha
      // no desktop e a linha de baixo inteira no celular.
      "[&>[data-actions-mode]]:mt-0 [&>[data-actions-mode]]:w-auto [&>[data-actions-mode]]:grow",
      "max-tablet:[&>[data-actions-mode]]:basis-full",
      className
    )}
    {...props}
  />
));

Tags.displayName = "PanelHeader.Tags";
