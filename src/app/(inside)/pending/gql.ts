import { gql } from "@apollo/client";

/** Uma pendência, como a amostra do cartão e a linha da lista a leem. */
const PENDING_ITEM_FIELDS = gql`
  fragment PendingItemFields on PendingItemType {
    id
    entityId
    clientId
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
    note
    orderId
    orderDate
    contactPhone
    installmentCount
  }
`;

/**
 * O RESUMO da central: um cartão por assunto e os contadores de prazo.
 *
 * Número e amostra de cada assunto vêm na MESMA consulta: os dois saem da mesma
 * leitura no backend, e pedir em separado abriria a janela para o cartão dizer
 * "3 visitas" ao lado de dois nomes.
 *
 * Sem `types`: os contadores por tipo já ignoram esse filtro, e os de prazo
 * contam a tela inteira. `limit: 1` porque a lista não é lida aqui — ela é de
 * `MyPendingCases`, só quando um cartão é aberto.
 */
export const MY_PENDING_ITEMS_QUERY = gql`
  query MyPendingItems(
    $sellerId: UUID
    $dueFrom: Date
    $dueTo: Date
    $when: PendingWhen
    $sampleSize: Int!
  ) {
    myPendingItems(
      sellerId: $sellerId
      dueFrom: $dueFrom
      dueTo: $dueTo
      when: $when
      sampleSize: $sampleSize
      offset: 0
      limit: 1
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
          samples {
            ...PendingItemFields
          }
        }
        whenCounts {
          when
          count
          highCount
        }
      }
    }
  }
  ${PENDING_ITEM_FIELDS}
`;

/**
 * A lista de UM assunto, uma página por vez — só quando alguém abre o cartão.
 * Mesmo recorte do resumo (vendedor, período, faixa de prazo), para a lista
 * nunca ter mais nem menos linhas do que o número do cartão promete.
 */
export const MY_PENDING_CASES_QUERY = gql`
  query MyPendingCases(
    $types: [PendingType!]
    $sellerId: UUID
    $dueFrom: Date
    $dueTo: Date
    $when: PendingWhen
    $offset: Int!
    $limit: Int!
  ) {
    myPendingItems(
      types: $types
      sellerId: $sellerId
      dueFrom: $dueFrom
      dueTo: $dueTo
      when: $when
      offset: $offset
      limit: $limit
    ) {
      status
      message
      data {
        totalCount
        items {
          ...PendingItemFields
        }
      }
    }
  }
  ${PENDING_ITEM_FIELDS}
`;

/** Vendedores para o filtro do gestor — o mesmo catálogo curto de /opportunities. */
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
