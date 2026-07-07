"use client";

import { createContext, useContext } from "react";

/**
 * Contexto da rota /clients/[id], onde `[id]` é o id da CARTEIRA (company_client),
 * não o id global do cliente. As abas filhas precisam do id do cliente global para
 * suas queries company-scoped — o layout resolve o vínculo uma vez e disponibiliza
 * ambos os ids aqui, evitando que cada aba traduza company_client → client por conta.
 */
export interface ClientRouteValue {
  companyClientId: string;
  clientId: string;
}

const ClientRouteContext = createContext<ClientRouteValue | null>(null);

export function ClientRouteProvider({
  value,
  children,
}: {
  value: ClientRouteValue;
  children: React.ReactNode;
}) {
  return (
    <ClientRouteContext.Provider value={value}>
      {children}
    </ClientRouteContext.Provider>
  );
}

export function useClientRoute(): ClientRouteValue {
  const ctx = useContext(ClientRouteContext);
  if (!ctx) {
    throw new Error("useClientRoute deve ser usado dentro de /clients/[id]");
  }
  return ctx;
}
