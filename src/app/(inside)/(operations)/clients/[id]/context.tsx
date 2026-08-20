"use client";

import { createContext, useContext } from "react";
import { ClientDetail } from "./interface";

/**
 * Contexto da rota /clients/[id], onde `[id]` é o id da CARTEIRA (company_client),
 * não o id global do cliente. As abas filhas precisam do id do cliente global para
 * suas queries company-scoped — o layout resolve o vínculo uma vez e disponibiliza
 * ambos os ids aqui, evitando que cada aba traduza company_client → client por conta.
 *
 * O `client` também desce por aqui, e não é detalhe de conveniência: o layout já
 * busca a ficha inteira (`COMPANY_CLIENT_QUERY` traz o cliente global aninhado),
 * e a aba Visão Geral repetia essa busca com outro documento (`CLIENT_QUERY`),
 * pedindo campo por campo o mesmo conteúdo. Como ela só descobre o `clientId`
 * DEPOIS que o layout responde, as duas idas à rede aconteciam em série — a
 * segunda começava onde a primeira terminou, e a tela ficava no esqueleto o
 * dobro do tempo por dado que já estava na mão.
 *
 * O estado otimista vem junto pelo mesmo motivo: com um por tela, editar o
 * endereço na aba não mexia no cabeçalho e editar a ficha no cabeçalho não
 * mexia na aba — dois valores para o mesmo cliente, na mesma página, até alguém
 * recarregar.
 */
export interface ClientRouteValue {
  companyClientId: string;
  clientId: string;
  /** Ficha do cliente já resolvida pelo layout, com o vínculo aninhado. */
  client: ClientDetail;
  /** Aplica a edição na tela antes da resposta do servidor. */
  updateOptimistic: (updates: Partial<ClientDetail>) => void;
  /** Confirma a edição otimista (o servidor aceitou). */
  commit: () => void;
  /** Desfaz a edição otimista (o servidor recusou). */
  rollback: () => void;
  /** Rebusca a ficha — cabeçalho e abas de uma vez, porque a query é uma só. */
  refetch: () => void;
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
