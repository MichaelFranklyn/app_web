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

/**
 * As linhas de comissão do MÊS aberto.
 *
 * O período recorta no servidor (ver o resolver `commissions`): a tela mostra um
 * mês por vez, e baixar a carteira inteira para exibir cinquenta linhas ficava
 * mais caro a cada mês de histórico. O que a tela mostra fora do mês vem junto
 * — estorno do vendedor sempre, boleto travado quando a aba de atraso pede
 * (`includeOverdue`).
 *
 * `latestReceiveDate` é medida antes do recorte: é por ela que a tela sabe em
 * que mês abrir sem precisar do histórico.
 *
 * Os totais da carteira inteira (`totalReceivable`…) ficam de fora de
 * propósito: os cartões somam o MÊS a partir das linhas (`summarizeMonth`), e
 * pedir os totais obriga o servidor a calcular o histórico todo.
 *
 * `includeUndated: false`: nenhuma aba do mês exibe parcela sem data de
 * recebimento, então ela só vem quando tem repasse, recebimento, calote ou
 * estorno ligado (o painel de estornos e a aba de atraso usam essas).
 */
export const COMMISSIONS_QUERY = gql`
  query Commissions(
    $sellerId: UUID
    $from: Date
    $to: Date
    $includeOverdue: Boolean
  ) {
    commissions(
      sellerId: $sellerId
      from: $from
      to: $to
      includeOverdue: $includeOverdue
      includeUndated: false
    ) {
      latestReceiveDate
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

/**
 * As linhas do mês INTEIRO, para o PDF do fechamento.
 *
 * A tela pede um mês ao servidor; o papel não pode. Ele tem duas seções que
 * seguem a data do BOLETO (o que o cliente pagou no mês, o que ele não pagou em
 * vencimento nenhum), e essas linhas simplesmente não estão no recorte da tela:
 * a comissão de um boleto pago em agosto costuma cair em setembro, e um calote
 * de março continua travado sem pertencer a mês algum.
 *
 * Por isso o papel pede ao servidor exatamente o que usa (ver `monthReport`):
 * a comissão que cai no mês E no seguinte (a prévia do próximo fechamento),
 * o boleto pago no mês (`paidFrom`/`paidTo`) e todo calote
 * (`includeDefaulted`). Antes buscava a carteira inteira — dezenas de MB num
 * histórico de anos para imprimir um mês.
 */
export const COMMISSIONS_PDF_QUERY = gql`
  query CommissionsForPdf(
    $sellerId: UUID
    $from: Date
    $to: Date
    $paidFrom: Date
    $paidTo: Date
  ) {
    commissions_pdf: commissions(
      sellerId: $sellerId
      from: $from
      to: $to
      paidFrom: $paidFrom
      paidTo: $paidTo
      includeDefaulted: true
    ) {
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

/**
 * Fábricas do vínculo da empresa, para o recorte opcional da baixa em lote.
 *
 * Não sai das linhas da tela de propósito: a tela mostra UM mês, e a baixa
 * trabalha num período de vencimento que não tem relação com ele — tirar a
 * lista dali fazia sumir a fábrica que não teve comissão naquele mês.
 */
export const COMMISSIONS_FACTORIES_QUERY = gql`
  query CommissionsFactories($input: BaseListInput!) {
    commissions_factories: companyFactories(input: $input) {
      edges {
        node {
          id
          factory {
            id
            nomeFantasia
            nickname
            razaoSocial
          }
        }
      }
      totalCount
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
