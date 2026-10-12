import { gql } from "@apollo/client";

/**
 * Os campos de uma parcela de comissão na tabela e na exportação.
 *
 * Os campos `seller*` vêm junto porque a comissão tem DOIS níveis: o que a
 * fábrica paga ao escritório (`amount`, para quem gerencia) e o que o
 * escritório repassa ao vendedor. A diferença entre eles é o que sobra para a
 * empresa — e é a pergunta que o relatório passou a responder.
 */
const COMMISSION_REPORT_ROW = gql`
  fragment CommissionReportRow on CommissionRowType {
    orderId
    installmentId
    sequence
    orderDate
    invoicedAt
    invoiceNumber
    dueDate
    paidAt
    installmentAmount
    amount
    status
    receiveDate
    isReceivable
    isReceived
    isReconciled
    reconciledAt
    isOverdue
    defaultedAt
    sellerAmount
    sellerStatus
    sellerReceiveDate
    isSellerPaid
    client {
      id
      razaoSocial
      nomeFantasia
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
`;

const COMMISSION_REPORT_TOTALS = gql`
  fragment CommissionReportTotals on CommissionReportTotalsType {
    receivable
    received
    pending
    count
    countReceivable
    chargeback
    countOverdue
    company
    seller
    office
    margin
  }
`;

/**
 * Uma página do relatório de comissões, com o que a tela soma.
 *
 * Período, filtros do painel, ordenação e paginação são do SERVIDOR (ver o
 * resolver `commissionReport`). Antes a query devolvia a carteira inteira — de
 * todos os anos — e o navegador recortava; num histórico longo eram dezenas de
 * MB e segundos para mostrar vinte linhas.
 *
 * - `periodTotals`/`byFactory`/opções: o PERÍODO inteiro (cartões, gráficos e o
 *   painel de filtros), que não muda quando se filtra uma fábrica;
 * - `filteredTotals`/`totalCount`: TODAS as linhas que os filtros deixaram, não
 *   só a página — é o rodapé da tabela.
 */
export const COMMISSIONS_REPORT_QUERY = gql`
  ${COMMISSION_REPORT_ROW}
  ${COMMISSION_REPORT_TOTALS}
  query CommissionsReport($input: CommissionReportInput!) {
    commissions_report: commissionReport(input: $input) {
      totalCount
      periodCount
      periodTotals {
        ...CommissionReportTotals
      }
      filteredTotals {
        ...CommissionReportTotals
      }
      byFactory {
        factoryId
        name
        receivable
        received
        pending
        count
        company
        seller
        office
        margin
      }
      factoryOptions {
        value
        label
      }
      sellerOptions {
        value
        label
      }
      statusOptions {
        value
        label
      }
      rows {
        ...CommissionReportRow
      }
    }
  }
`;

/**
 * As linhas para o arquivo: o MESMO `input` da tela, página a página, sem os
 * totais (ver `fetchAllCommissionRows`). Independe da página que está aberta.
 */
export const COMMISSIONS_REPORT_EXPORT_QUERY = gql`
  ${COMMISSION_REPORT_ROW}
  query CommissionsReportExport($input: CommissionReportInput!) {
    commissions_report_export: commissionReport(input: $input) {
      totalCount
      rows {
        ...CommissionReportRow
      }
    }
  }
`;
