import { gql } from "@apollo/client";

export const SELLER_GOALS_QUERY = gql`
  query SellerGoals($periodMonth: Date!, $sellerId: UUID) {
    sellerGoals(periodMonth: $periodMonth, sellerId: $sellerId) {
      periodMonth
      rows {
        goalId
        sellerId
        factoryId
        periodMonth
        seller {
          id
          name
        }
        factory {
          id
          nomeFantasia
          nickname
          razaoSocial
        }
        targetInvoicedAmount
        targetOrderedAmount
        targetPositivations
        targetVisits
        invoicedAmount
        orderedAmount
        positivations
        visits
      }
    }
  }
`;

// Vendedores da empresa — só o gestor escolhe de quem ver/definir a meta.
export const GOALS_SELLERS_QUERY = gql`
  query GoalsSellers($input: BaseListInput!) {
    goals_sellers: sellers(input: $input) {
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

// Fábricas representadas pela empresa: são elas que podem receber meta.
export const GOALS_FACTORIES_QUERY = gql`
  query GoalsFactories($input: BaseListInput!) {
    goals_factories: companyFactories(input: $input) {
      edges {
        node {
          id
          factoryId
          nickname
          factory {
            id
            nomeFantasia
            razaoSocial
          }
        }
      }
      totalCount
    }
  }
`;

export const SET_SELLER_GOAL_MUTATION = gql`
  mutation SetSellerGoal($input: SetSellerGoalInput!) {
    setSellerGoal(input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`;

export const DELETE_SELLER_GOAL_MUTATION = gql`
  mutation DeleteSellerGoal($id: UUID!) {
    deleteSellerGoal(id: $id) {
      status
      message
    }
  }
`;

export const COPY_SELLER_GOALS_MUTATION = gql`
  mutation CopySellerGoals(
    $fromMonth: Date!
    $toMonth: Date!
    $sellerId: UUID
    $overwrite: Boolean
  ) {
    copySellerGoals(
      fromMonth: $fromMonth
      toMonth: $toMonth
      sellerId: $sellerId
      overwrite: $overwrite
    ) {
      status
      message
    }
  }
`;
