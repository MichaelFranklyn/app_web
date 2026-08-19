import { gql } from "@apollo/client";

// Lista de vendedores para o seletor do gestor (owner/admin/su).
export const COMMISSIONS_SELLERS_QUERY = gql`
  query CommissionsSellers($input: BaseListInput!) {
    commissions_sellers: sellers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
`;

export const COMMISSIONS_QUERY = gql`
  query Commissions($sellerId: UUID) {
    commissions(sellerId: $sellerId) {
      totalReceivable
      totalReceived
      totalPending
      countReceivable
      totalChargeback
      totalSellerChargeback
      totalSellerChargebackPending
      totalRefund
      totalSellerRefund
      countOverdue
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
        isChargebackSettled
        chargebackSettledAt
        sellerAmount
        sellerStatus
        sellerReceiveDate
        isSellerPaid
        sellerChargebackMonth
        isSellerChargebackSettled
        sellerChargebackSettledAt
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

export const MARK_COMMISSION_RECEIVED_MUTATION = gql`
  mutation MarkCommissionReceived(
    $installmentIds: [UUID!]!
    $receivedAt: Date!
  ) {
    markCommissionReceived(
      installmentIds: $installmentIds
      receivedAt: $receivedAt
    ) {
      status
      message
    }
  }
`;

export const SET_COMMISSION_RECONCILED_MUTATION = gql`
  mutation SetCommissionReconciled(
    $installmentIds: [UUID!]!
    $reconciled: Boolean!
  ) {
    setCommissionReconciled(
      installmentIds: $installmentIds
      reconciled: $reconciled
    ) {
      status
      message
    }
  }
`;

export const PAY_ORDER_INSTALLMENTS_MUTATION = gql`
  mutation PayOrderInstallments($installmentIds: [UUID!]!, $paidAt: Date!) {
    payOrderInstallments(installmentIds: $installmentIds, paidAt: $paidAt) {
      status
      message
    }
  }
`;

export const MARK_INSTALLMENTS_DEFAULTED_MUTATION = gql`
  mutation MarkOrderInstallmentsDefaulted(
    $installmentIds: [UUID!]!
    $defaultedAt: Date!
  ) {
    markOrderInstallmentsDefaulted(
      installmentIds: $installmentIds
      defaultedAt: $defaultedAt
    ) {
      status
      message
    }
  }
`;

export const MARK_SELLER_COMMISSION_PAID_MUTATION = gql`
  mutation MarkSellerCommissionPaid($installmentIds: [UUID!]!, $paidAt: Date!) {
    markSellerCommissionPaid(installmentIds: $installmentIds, paidAt: $paidAt) {
      status
      message
    }
  }
`;

export const SCHEDULE_SELLER_CHARGEBACK_MUTATION = gql`
  mutation ScheduleSellerChargeback($installmentIds: [UUID!]!, $month: Date) {
    scheduleSellerChargeback(installmentIds: $installmentIds, month: $month) {
      status
      message
    }
  }
`;

/**
 * Quanto a baixa em lote pegaria. O número vem do SERVIDOR, não das linhas
 * carregadas: a tela está recortada por mês e por situação, e o que a baixa
 * alcança é outra coisa — prometer "12 boletos" e baixar 150 seria péssimo.
 */
export const SETTLE_PREVIEW_QUERY = gql`
  query SettleInstallmentsPreview(
    $dueFrom: Date!
    $dueTo: Date!
    $factoryId: UUID
    $sellerId: UUID
  ) {
    settleInstallmentsPreview(
      dueFrom: $dueFrom
      dueTo: $dueTo
      factoryId: $factoryId
      sellerId: $sellerId
    ) {
      count
      amount
    }
  }
`;

export const SETTLE_INSTALLMENTS_IN_PERIOD_MUTATION = gql`
  mutation SettleInstallmentsInPeriod(
    $dueFrom: Date!
    $dueTo: Date!
    $factoryId: UUID
    $sellerId: UUID
    $paidAt: Date
  ) {
    settleInstallmentsInPeriod(
      dueFrom: $dueFrom
      dueTo: $dueTo
      factoryId: $factoryId
      sellerId: $sellerId
      paidAt: $paidAt
    ) {
      status
      message
    }
  }
`;

export const UNMARK_COMMISSION_RECEIVED_MUTATION = gql`
  mutation UnmarkCommissionReceived($installmentIds: [UUID!]!) {
    unmarkCommissionReceived(installmentIds: $installmentIds) {
      status
      message
    }
  }
`;

export const UNMARK_SELLER_COMMISSION_PAID_MUTATION = gql`
  mutation UnmarkSellerCommissionPaid($installmentIds: [UUID!]!) {
    unmarkSellerCommissionPaid(installmentIds: $installmentIds) {
      status
      message
    }
  }
`;

/** Volta o boleto para "em aberto" — desfaz pagamento ou inadimplência. */
export const REVERT_ORDER_INSTALLMENT_MUTATION = gql`
  mutation RevertOrderInstallment($id: UUID!) {
    revertOrderInstallment(id: $id) {
      status
      message
    }
  }
`;

/** Baixa do estorno no nível da fábrica: ele vira histórico e sai do fechamento. */
export const MARK_CHARGEBACK_SETTLED_MUTATION = gql`
  mutation MarkChargebackSettled($installmentIds: [UUID!]!, $settledAt: Date!) {
    markChargebackSettled(
      installmentIds: $installmentIds
      settledAt: $settledAt
    ) {
      status
      message
    }
  }
`;

/** Baixa do desconto na comissão do vendedor (exige o mês já agendado). */
export const MARK_SELLER_CHARGEBACK_SETTLED_MUTATION = gql`
  mutation MarkSellerChargebackSettled(
    $installmentIds: [UUID!]!
    $settledAt: Date!
  ) {
    markSellerChargebackSettled(
      installmentIds: $installmentIds
      settledAt: $settledAt
    ) {
      status
      message
    }
  }
`;

/** Encerra a devolução da fábrica ao escritório. */
export const MARK_CHARGEBACK_REFUNDED_MUTATION = gql`
  mutation MarkChargebackRefunded($installmentIds: [UUID!]!) {
    markChargebackRefunded(installmentIds: $installmentIds) {
      status
      message
    }
  }
`;

/** Encerra a devolução do escritório ao vendedor. */
export const MARK_SELLER_CHARGEBACK_REFUNDED_MUTATION = gql`
  mutation MarkSellerChargebackRefunded($installmentIds: [UUID!]!) {
    markSellerChargebackRefunded(installmentIds: $installmentIds) {
      status
      message
    }
  }
`;
