"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

/**
 * Quem atende um cliente numa fábrica hoje — inclusive quando é outro vendedor.
 *
 * Cada par cliente+fábrica tem UM vendedor responsável. Ao vincular, o sistema
 * precisa saber disso antes de o usuário mandar salvar: em vez de deixar o
 * cadastro morrer no erro "já possui um vendedor designado", a tela avisa de
 * quem é o cliente e oferece transferir o atendimento.
 *
 * Vive fora das páginas porque as três telas que criam vínculo (cliente,
 * fábrica e perfil do vendedor) fazem a mesma pergunta.
 */
export const CLIENT_FACTORY_ASSIGNMENT_QUERY = gql`
  query ClientFactoryAssignment($clientId: UUID!, $factoryId: UUID!) {
    clientFactoryAssignment(clientId: $clientId, factoryId: $factoryId) {
      status
      data {
        id
        sellerId
        seller {
          id
          name
        }
      }
    }
  }
`;

interface AssignmentResponse {
  clientFactoryAssignment: {
    status: boolean;
    data: {
      id: string;
      sellerId: string;
      seller: { id: string; name: string } | null;
    } | null;
  };
}

/**
 * Texto da confirmação de transferência. Fica junto do hook porque as três telas
 * de vínculo mostram exatamente o mesmo aviso — e ele precisa dizer, em bom
 * português, o que muda e o que NÃO muda (o histórico).
 */
export function buildTakeoverMessage(
  currentSellerName: string | null,
  newSellerName: string | null
) {
  const atual = currentSellerName ?? "outro vendedor";
  const novo = newSellerName ? `para ${newSellerName}` : "para o novo vendedor";
  return (
    `Hoje quem atende este cliente nesta fábrica é ${atual}. ` +
    `Ao continuar, o atendimento passa ${novo} e as visitas ainda não realizadas ` +
    `vão para a agenda dele. Os pedidos, as comissões e as visitas já feitas por ` +
    `${atual} continuam guardados no histórico.`
  );
}

interface Params {
  clientId?: string | null;
  factoryId?: string | null;
  /** Vendedor que a tela quer designar; define se é transferência ou não. */
  sellerId?: string | null;
  /** Só consulta com o modal aberto. */
  enabled?: boolean;
}

export function useClientFactoryAssignment({
  clientId,
  factoryId,
  sellerId,
  enabled = true,
}: Params) {
  const skip = !enabled || !clientId || !factoryId;

  const { data, loading } = useQuery<AssignmentResponse>(
    CLIENT_FACTORY_ASSIGNMENT_QUERY,
    {
      variables: { clientId, factoryId },
      skip,
      // Vínculo muda por ação de outra pessoa; um cache velho aqui faria a tela
      // prometer uma transferência que o backend recusa (ou o contrário).
      fetchPolicy: "network-only",
    }
  );

  const assignment = skip
    ? null
    : (data?.clientFactoryAssignment?.data ?? null);
  const currentSellerId = assignment?.sellerId ?? null;

  return {
    loading,
    /** Vendedor que atende hoje; nulo quando a fábrica está livre para este cliente. */
    currentSellerName: assignment?.seller?.name ?? null,
    /** O cliente já é deste mesmo vendedor — vincular de novo não faz nada. */
    isSameSeller: Boolean(
      currentSellerId && sellerId && currentSellerId === sellerId
    ),
    /** Existe vínculo com OUTRO vendedor: salvar significa transferir. */
    isTakeover: Boolean(
      currentSellerId && sellerId && currentSellerId !== sellerId
    ),
  };
}
