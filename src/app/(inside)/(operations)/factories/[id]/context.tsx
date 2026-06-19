"use client";

import { createContext, ReactNode, useContext } from "react";
import { CompanyFactoryDetail } from "./interface";

interface FactoryDetailContextValue {
  companyFactory: CompanyFactoryDetail;
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
