"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";

import { MyPlan, PlanFeature } from "./interface";

/** O contrato da empresa, sem o uso — que custa contagem e vem sob demanda em
 * `usePlanLimit`. */
export type PlanContract = Pick<MyPlan, "code" | "label" | "features">;

interface PlanContextValue extends PlanContract {
  hasFeature: (feature: PlanFeature) => boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

/**
 * O que a empresa contratou, disponível em qualquer lugar da casca autenticada.
 *
 * Vem do SSR (ver o layout de `(inside)`), e não de um fetch no cliente, por um
 * motivo de tela: com fetch, a sidebar renderizaria antes da resposta e os itens
 * apareceriam — ou sumiriam — meio segundo depois, na cara de quem está lendo.
 */
export const usePlan = (): PlanContextValue => {
  const context = useContext(PlanContext);
  if (!context) throw new Error("usePlan precisa estar dentro de PlanProvider");
  return context;
};

/** Atalho para o caso mais comum: mostrar ou não um pedaço da tela. */
export const useFeature = (feature: PlanFeature): boolean =>
  usePlan().hasFeature(feature);

export const PlanProvider = ({
  plan,
  children,
}: {
  plan: PlanContract;
  children: ReactNode;
}) => {
  const value = useMemo<PlanContextValue>(
    () => ({
      ...plan,
      hasFeature: (feature) => plan.features.includes(feature),
    }),
    [plan]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};
