import { gql } from "@apollo/client";

/**
 * A central de pendências: uma lista só, calculada na hora.
 *
 * Lista e contadores vêm na MESMA consulta: os dois saem da mesma leitura no
 * backend, e pedir em separado abriria a janela para o contador dizer "3
 * visitas" ao lado de uma lista com duas.
 */
export const MY_PENDING_ITEMS_QUERY = gql`
  query MyPendingItems(
    $types: [PendingType!]
    $sellerId: UUID
    $dueFrom: Date
    $dueTo: Date
    $offset: Int!
    $limit: Int!
  ) {
    myPendingItems(
      types: $types
      sellerId: $sellerId
      dueFrom: $dueFrom
      dueTo: $dueTo
      offset: $offset
      limit: $limit
    ) {
      status
      message
      data {
        generatedAt
        totalCount
        counts {
          type
          count
          highCount
        }
        items {
          id
          type
          reason
          priority
          dueDate
          daysLate
          clientName
          link
          clientLink
          factoryName
          sellerId
          sellerName
          amount
          referenceDate
          isRemote
          allowanceDays
          isEstimated
          highAfterDays
          scheduledDate
        }
      }
    }
  }
`;

/** Vendedores para o filtro do gestor — o mesmo catálogo curto de /insights. */
export const PENDING_SELLERS_QUERY = gql`
  query PendingSellers($input: BaseListInput!) {
    pending_sellers: sellers(input: $input) {
      edges {
        node {
          id
          name
          isActive
        }
      }
      totalCount
    }
  }
`;
