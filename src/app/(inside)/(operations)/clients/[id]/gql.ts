import { gql } from "@apollo/client";

export const SELLER_CLIENT_FACTORIES_QUERY = gql`
  query SellerClientFactoriesByClient($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          priority
          visitFrequencyDays
          orderIntervalDays
          lastVisitDate
          cadence {
            days
            source
            isDivergent
            declaredDays
            observedDays
            nextOrderDue
            nextVisitEstimate
            divergenceMessage
          }
          factory {
            id
            nomeFantasia
            nickname
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
            nickname
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

// Score mais recente de cada fábrica do cliente, já ordenado do mais quente ao
// mais frio pelo backend. Substitui o antigo "pega um vínculo qualquer com
// first: 1 e sem order", que fazia a aba falar de uma fábrica sorteada.
export const CLIENT_FACTORY_SCORES_QUERY = gql`
  query ClientFactoryScores($id: UUID!) {
    companyClient(id: $id) {
      data {
        id
        factoryVisitScores {
          scoreDate
          scoreTotal
          scoreUrgency
          scorePriority
          scoreFrequency
          scorePotential
          scoreRecency
          stockConfidence
          clientFactoryLink {
            id
            factory {
              id
              nomeFantasia
              nickname
            }
          }
        }
      }
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
          stockConfidence
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
          shelfDaysObservedAt
          product {
            id
            name
            unit {
              label
            }
          }
          # Últimas compras do produto: é delas que sai a duração média, então
          # mostrá-las ao lado da estimativa deixa a conta auditável.
          recentPurchases {
            orderId
            purchaseDate
            quantity
            unitPrice
          }
        }
      }
      totalCount
    }
  }
`;

// Visitas do CLIENTE, em todas as fábricas. A visita é ao cliente: uma ida cobre
// várias fábricas, e o vínculo do item é só a principal daquele dia. Filtrar por
// vínculo mostrava ~1/28 das visitas, escolhidas por qual fábrica estava quente.
export const CLIENT_VISITS_QUERY = gql`
  query VisitsByCompanyClient($companyClientId: UUID!, $input: BaseListInput!) {
    visitsByCompanyClient(companyClientId: $companyClientId, input: $input) {
      edges {
        node {
          id
          contactType
          status
          outcome
          outcomeReason
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
          focusFactories {
            scoreTotal
            factory {
              id
              nomeFantasia
              nickname
              razaoSocial
            }
          }
          treatedFactories {
            id
            nomeFantasia
            razaoSocial
          }
          clientFactoryLink {
            id
            client {
              id
              nomeFantasia
              razaoSocial
            }
            factory {
              id
              nomeFantasia
              nickname
              razaoSocial
            }
          }
        }
      }
      totalCount
    }
  }
`;

// Estoque estimado por fábrica: quantos produtos zerados e críticos em cada.
export const CLIENT_FACTORY_STOCK_QUERY = gql`
  query ClientFactoryStock($id: UUID!) {
    companyClient(id: $id) {
      data {
        id
        factoryStockSummaries {
          sellerClientFactoryId
          totalProducts
          stockedOut
          critical
          factory {
            id
            nomeFantasia
            nickname
            razaoSocial
          }
        }
      }
    }
  }
`;

// Pedidos agregados por fábrica: o backend já ordena da compra mais recente à
// mais antiga e inclui as fábricas em que o cliente nunca comprou.
export const CLIENT_FACTORY_ORDERS_QUERY = gql`
  query ClientFactoryOrders($id: UUID!) {
    companyClient(id: $id) {
      data {
        id
        factoryOrderSummaries {
          sellerClientFactoryId
          sellerId
          totalOrders
          totalAmount
          lastOrderDate
          factory {
            id
            nomeFantasia
            nickname
            razaoSocial
          }
        }
      }
    }
  }
`;

export const COMPANY_CLIENT_QUERY = gql`
  query CompanyClient($id: UUID!) {
    companyClient(id: $id) {
      status
      code
      message
      data {
        id
        notes
        isActive
        networkId
        segmentId
        network {
          id
          name
        }
        segment {
          id
          name
        }
        topVisitScore {
          scoreTotal
          scoreUrgency
          scorePriority
          scoreFrequency
          scorePotential
          scoreRecency
          stockConfidence
        }
        factoryVisitScores {
          scoreDate
          scoreTotal
          scoreUrgency
          scorePriority
          scoreFrequency
          scorePotential
          scoreRecency
          stockConfidence
          clientFactoryLink {
            id
            factory {
              id
              nomeFantasia
              nickname
            }
          }
        }
        client {
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
        }
      }
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
          networkId
          segmentId
          network {
            id
            name
          }
          segment {
            id
            name
          }
        }
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
          nickname
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
          nickname
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

export const UPDATE_PRODUCT_STOCK_MUTATION = gql`
  mutation UpdateProductStock(
    $sellerClientFactoryId: UUID!
    $productId: UUID!
    $daysRemaining: Int
    $notes: String
  ) {
    updateProductStock(
      sellerClientFactoryId: $sellerClientFactoryId
      productId: $productId
      daysRemaining: $daysRemaining
      notes: $notes
    ) {
      status
      code
      message
      data {
        id
        productId
        daysRemaining
        observation
      }
    }
  }
`;
