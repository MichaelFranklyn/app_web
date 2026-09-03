"use client";

import { createContext, ReactNode, useContext } from "react";
import { CompanyFactoryDetail } from "./interface";

interface FactoryDetailContextValue {
  companyFactory: CompanyFactoryDetail;
  /**
   * Há um pedido pendente de aplicar a taxa de comissão aos pedidos já
   * faturados (ver `ApplyCommissionRateModal`).
   *
   * Mora no contexto porque quem PEDE e quem MOSTRA estão em subárvores
   * diferentes: o pedido nasce ao salvar o vínculo (modal do cabeçalho, visível
   * em qualquer aba) ou no botão ao lado da comissão (aba Visão geral), e o
   * modal é montado uma vez só, no cabeçalho.
   */
  applyRatePrompt: boolean;
  setApplyRatePrompt: (open: boolean) => void;
  updateOptimistic: (updates: Partial<CompanyFactoryDetail>) => void;
  commit: () => void;
  rollback: () => void;
  refetch: () => void;
}

const FactoryDetailContext = createContext<FactoryDetailContextValue | null>(
  null
);

export function FactoryDetailProvider({
  value,
  children,
}: {
  value: FactoryDetailContextValue;
  children: ReactNode;
}) {
  return (
    <FactoryDetailContext.Provider value={value}>
      {children}
    </FactoryDetailContext.Provider>
  );
}

export function useFactoryDetail() {
  const ctx = useContext(FactoryDetailContext);
  if (!ctx) {
    throw new Error(
      "useFactoryDetail must be used inside FactoryDetailProvider"
    );
  }
  return ctx;
}
