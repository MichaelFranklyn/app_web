import { StepperOrientation, StepperSize } from "../Root/context";

/** Um marco da trilha. É só o rótulo: o conteúdo do passo não passa por aqui. */
export interface StepperTrailStep {
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface StepperTrailProps {
  steps: readonly StepperTrailStep[];
  /** Índice do passo atual (0-based). */
  current: number;
  /** Presente = a trilha é clicável (voltar a um passo cumprido). */
  onChange?: (index: number) => void;
  orientation?: StepperOrientation;
  size?: StepperSize;
  /**
   * Centraliza a faixa. Usa `w-max` + `mx-auto` em vez de `justify-center`
   * porque a faixa rola no horizontal: com `justify-center`, uma trilha maior
   * que a tela ficaria cortada no começo e sem como voltar.
   */
  centered?: boolean;
  /** Respiro no contexto de uso (ex.: distância até o formulário no modal). */
  className?: string;
}
