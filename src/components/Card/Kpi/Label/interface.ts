import React from "react";

/**
 * Rótulo do cartão de número: só texto (e o "?" de ajuda). Sem ícone — o
 * desenho ao lado do rótulo foi retirado do sistema inteiro (23/11/2026):
 * para o público idoso, o nome diz o que o número é; o ícone só competia.
 */
export interface CardKpiLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Explicação do número num "?" logo depois do rótulo (`HelpTooltip`). Use
   * isto — não monte o "?" à mão com `className` no rótulo.
   */
  help?: React.ReactNode;
}
