import { gql } from "@apollo/client";

// Séries mensais por entidade: vendedor e fábrica devolvem o mesmo formato
// (mês + entidade + total), consumido pelo componente genérico
// EntityMonthSeriesChart.

export const REVENUE_BY_SELLER_MONTH_QUERY = gql`
  query RevenueBySellerMonth(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    revenueBySellerMonth(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      month
      entityId
      entityName
      total
      orderCount
    }
  }
`;

export const REVENUE_BY_FACTORY_MONTH_QUERY = gql`
  query RevenueByFactoryMonth(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    revenueByFactoryMonth(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      month
      entityId
      entityName
      total
      orderCount
    }
  }
`;
