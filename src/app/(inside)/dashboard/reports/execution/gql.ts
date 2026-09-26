import { gql } from "@apollo/client";

/**
 * A execução da rotina no período: quantas visitas planejadas tiveram resposta,
 * por vendedor, e se o lift do motor já pode ser lido.
 *
 * É o mesmo `visitAccuracyReport` que mede o acerto do motor — a execução é o
 * pré-requisito dele (sem visita registrada, não há acerto a medir). Rota fixa
 * fica de fora, como no relatório de acerto.
 */
export const VISIT_EXECUTION_REPORT_QUERY = gql`
  query VisitExecutionReport($from: Date, $to: Date, $sellerId: UUID) {
    visitAccuracyReport(from: $from, to: $to, sellerId: $sellerId) {
      planned
      worked
      workedInferred
      autoClosed
      pending
      converted
      conversionRate
      executionRate
      baselineRate
      lift
      isLiftReliable
      orderAmount
      sellers {
        sellerId
        sellerName
        planned
        worked
        workedInferred
        autoClosed
        pending
        converted
        executionRate
        conversionRate
        orderAmount
      }
    }
  }
`;
