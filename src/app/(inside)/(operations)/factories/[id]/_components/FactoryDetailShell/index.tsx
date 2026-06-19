"use client";

import { useOptimisticObject } from "@/hooks/useOptimisticObject";
import { ReactNode } from "react";
import { FactoryDetailProvider } from "../../context";
import { CompanyFactoryDetail } from "../../interface";
import { FactoryChrome } from "../FactoryChrome";
import { FactoryNavList } from "../FactoryNavList";
import { FactoryPageHeader } from "../FactoryPageHeader";

interface Props {
  companyFactory: CompanyFactoryDetail;
  basePath: string;
  onRefetch: () => void;
  children: ReactNode;
}

/**
 * Casca client do detalhe da fábrica: mantém o estado otimista do
 * company_factory (server data) e o expõe via contexto para o header e abas.
 * Reconciliação via `onRefetch` (server action de revalidate).
 */
export function FactoryDetailShell({
  companyFactory,
  basePath,
  onRefetch,
  children,
}: Props) {
  const optimistic = useOptimisticObject<CompanyFactoryDetail>({
    initialData: companyFactory,
  });

  return (
    <FactoryDetailProvider
      value={{
        companyFactory: optimistic.data,
        updateOptimistic: optimistic.updateOptimistic,
        commit: optimistic.commit,
        rollback: optimistic.rollback,
        refetch: onRefetch,
      }}
    >
      <FactoryChrome basePath={basePath}>
        <FactoryPageHeader companyFactory={optimistic.data} />
      </FactoryChrome>

      <div className="flex w-full flex-col">
        <FactoryChrome basePath={basePath}>
          <FactoryNavList basePath={basePath} />
        </FactoryChrome>

        {children}
      </div>
    </FactoryDetailProvider>
  );
}
