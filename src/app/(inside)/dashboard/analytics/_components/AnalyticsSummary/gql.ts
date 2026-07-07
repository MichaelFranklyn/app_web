import { gql } from "@apollo/client";

// Resumo (bignumbers) do recorte: total de pedidos, faturamento, ticket médio e
// clientes ativos. Aceita os mesmos filtros dos gráficos (período/vendedor).
export const DASHBOARD_SUMMARY_QUERY = gql`
  query DashboardSummary($from: Date, $to: Date, $sellerId: UUID) {
    dashboardSummary(from: $from, to: $to, sellerId: $sellerId) {
      totalOrders
      totalAmount
      avgTicket
      activeClients
    }
  }
`;
