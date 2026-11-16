import React from "react";
import type { KpiStatus } from "../Value/style";

export interface CardKpiRootProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "onClick"
> {
  children: React.ReactNode;
  /**
   * O cartão vira um FILTRO: clicar aplica o recorte que ele conta (as
   * pendências atrasadas, as de hoje). Sai como `<button aria-pressed>`. Sem
   * `onClick`, é só leitura.
   */
  onClick?: () => void;
  /** O recorte deste cartão é o que está valendo agora (borda âmbar). */
  active?: boolean;
}

export interface KpiItem {
  label: string;
  value: string;
  delta: string;
  /**
   * Explicação do número, mostrada num "?" ao lado do rótulo. Opcional: onde o
   * rótulo já é autoexplicativo o ícone só polui — mas em cartão que soma
   * dinheiro por um critério (só o faturado, só a mercadoria) ele é o que
   * impede a leitura errada.
   */
  help?: React.ReactNode;
  positive?: boolean;
  negative?: boolean;
  status: KpiStatus;
}
