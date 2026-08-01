import { gql } from "@apollo/client";

/**
 * As duas grandezas do desenho saem de UMA agregação: `avgTicketByMonth` já
 * devolve, para cada mês, o valor médio do pedido e quantos pedidos entraram na
 * média — que é exatamente a contagem de `ordersByMonth` (mesmo recorte, mesmo
 * agrupamento).
 *
 * Pedir os dois campos no mesmo documento seria o caminho óbvio e está errado: o
 * backend resolve os campos-raiz em paralelo sobre a MESMA sessão do SQLAlchemy
 * e a operação estoura em 500 (`IllegalStateChangeError`).
 */
export const ORDERS_AND_TICKET_BY_MONTH_QUERY = gql`
  query OrdersAndTicketByMonth($from: Date, $to: Date, $sellerId: UUID) {
    avgTicketByMonth(from: $from, to: $to, sellerId: $sellerId) {
      month
      avgTicket
      orderCount
    }
  }
`;
