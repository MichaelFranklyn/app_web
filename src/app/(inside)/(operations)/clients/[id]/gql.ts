import { gql } from "@apollo/client";

export const SELLER_CLIENT_FACTORIES_QUERY = gql`
  query SellerClientFactoriesByClient($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          priority
          visitFrequencyDays
          lastVisitDate
          factory {
            id
            nomeFantasia
            razaoSocial
          }
          seller {
            id
            name
          }
        }
      }
      totalCount
    }
  }
`;

export const CLIENT_ORDERS_QUERY = gql`
  query ClientOrders($input: BaseListInput!) {
    orders(input: $input) {
      edges {
        node {
          id
          orderDate
          totalAmount
          status
          notes
          factory {
            id
            nomeFantasia
            razaoSocial
          }
          seller {
            id
            name
          }
        }
      }
      totalCount
    }
  }
`;

export const CLIENT_VISIT_SCORES_QUERY = gql`
  query ClientVisitScores(
    $sellerClientFactoryId: UUID!
    $input: BaseListInput!
  ) {
    clientVisitScores(
      sellerClientFactoryId: $sellerClientFactoryId
      input: $input
    ) {
      edges {
        node {
          id
          scoreDate
          scoreTotal
          scoreUrgency
          scorePriority
          scoreFrequency
          scorePotential
          scoreRecency
          recommendedProducts
          stockoutAlerts
        }
      }
      totalCount
    }
  }
`;

export const CLIENT_PRODUCT_INSIGHTS_QUERY = gql`
  query ClientProductInsights(
    $sellerClientFactoryId: UUID!
    $input: BaseListInput!
  ) {
    clientProductInsights(
      sellerClientFactoryId: $sellerClientFactoryId
      input: $input
    ) {
      edges {
        node {
          id
          lastPurchaseDate
          lastQuantity
          avgQuantity
          avgShelfDays
          avgIntervalDays
          estimatedStockoutDate
          daysSinceStockout
          nextPurchaseEstimate
          churnRisk
          product {
            id
            name
            unit {
              label
            }
          }
        }
      }
      totalCount
    }
  }
`;

export const CLIENT_VISITS_QUERY = gql`
  query VisitsBySellerClientFactory(
    $sellerClientFactoryId: UUID!
    $input: BaseListInput!
  ) {
    visitsBySellerClientFactory(
      sellerClientFactoryId: $sellerClientFactoryId
      input: $input
    ) {
      edges {
        node {
          id
          status
          outcome
          outcomeReason
          stockObservation
          actualVisitAt
          notes
          day {
            id
            date
            schedule {
              id
              seller {
                id
                name
              }
            }
          }
          clientFactoryLink {
            id
            factory {
              id
              nomeFantasia
              razaoSocial
            }
          }
        }
      }
      totalCount
    }
  }
`;

export const CLIENT_QUERY = gql`
  query Client($id: UUID!) {
    client(id: $id) {
      status
      code
      message
      data {
        id
        cnpj
        razaoSocial
        nomeFantasia
        cnae
        cnaeDescription
        addressStreet
        addressNumber
        addressComplement
        addressNeighborhood
        addressZip
        addressCity
        addressState
        createdAt
        updatedAt
        companyClient {
          id
          notes
          isActive
        }
      }
    }
  }
`;

export const UPDATE_CLIENT_NOTES_MUTATION = gql`
  mutation UpdateClientNotes($id: UUID!, $input: UpdateClientNotesInput!) {
    updateClientNotes(id: $id, input: $input) {
      status
      code
      message
      data {
        id
        notes
        updatedAt
      }
    }
  }
`;

export const CREATE_SELLER_CLIENT_FACTORY_MUTATION = gql`
  mutation CreateSellerClientFactory($input: CreateSellerClientFactoryInput!) {
    createSellerClientFactory(input: $input) {
      status
      code
      message
      data {
        id
        priority
        visitFrequencyDays
        factory {
          id
          nomeFantasia
          razaoSocial
        }
        seller {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_SELLER_CLIENT_FACTORY_MUTATION = gql`
  mutation UpdateSellerClientFactory(
    $id: UUID!
    $input: UpdateSellerClientFactoryInput!
  ) {
    updateSellerClientFactory(id: $id, input: $input) {
      status
      code
      message
      data {
        id
        priority
        visitFrequencyDays
        lastVisitDate
        factory {
          id
          nomeFantasia
          razaoSocial
        }
        seller {
          id
          name
        }
      }
    }
  }
`;
