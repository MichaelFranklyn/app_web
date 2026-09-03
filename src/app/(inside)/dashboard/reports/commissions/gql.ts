import { gql } from "@apollo/client";

/**
 * Todas as parcelas de comissão do vendedor/empresa — a query não recebe período.
 *
 * Os campos `seller*` vêm junto porque a comissão tem DOIS níveis: o que a
 * fábrica paga ao escritório (`amount`, para quem gerencia) e o que o
 * escritório repassa ao vendedor. A diferença entre eles é o que sobra para a
 * empresa — e é a pergunta que o relatório passou a responder.
 *
 * O recorte do relatório é aplicado no cliente (ver `filterByPeriod`), como já faz
 * a tela de Comissões: a comissão "cai" numa data (`receiveDate`) derivada do
 * faturamento e do prazo, e é por ela que se pergunta "quanto entra em julho".
 */
export const COMMISSIONS_REPORT_QUERY = gql`
  query CommissionsReport($sellerId: UUID) {
    commissions_report: commissions(sellerId: $sellerId) {
      totalReceivable
      totalReceived
      totalPending
      countReceivable
      rows {
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
    }
  }
`;
