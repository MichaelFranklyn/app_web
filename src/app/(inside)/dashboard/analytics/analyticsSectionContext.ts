"use client";

import { createContext, useContext } from "react";

/**
 * Em que parte da história o card está.
 *
 * A tela mostra isso pelo cabeçalho da seção — no papel, sem essa informação, o
 * PDF vira trinta gráficos em fila sem nenhuma divisão. O card lê daqui para
 * registrar a parte junto com a imagem no export.
 */
export interface AnalyticsSectionContextValue {
  /** Título da parte ("Sua carteira de clientes"), ou "" fora de uma seção. */
  title: string;
  /** "Parte 4 de 7", quando a seção informa a posição. */
  step: string;
}

export const AnalyticsSectionContext =
  createContext<AnalyticsSectionContextValue>({ title: "", step: "" });

export const useAnalyticsSection = () => useContext(AnalyticsSectionContext);
