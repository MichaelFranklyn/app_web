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

/** Os campos de uma parcela na tabela, no painel de estornos e no PDF. */
const COMMISSION_ROW = gql`
  fragment CommissionRowFields on CommissionRowType {
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
`;

/**
 * O MÊS aberto, já somado no servidor.
 *
 * Mês, situação, ótica, filtros do painel e ordenação vão na consulta (ver o
 * resolver `commissionMonth`). Antes a tela baixava todas as parcelas do
 * recorte e fazia as contas aqui; num mês com uma baixa em lote eram milhares
 * de linhas e megabytes para mostrar três cartões.
 *
 * - `commission_month`: os cartões do mês, a repartição do escritório, um
 *   resumo por fábrica (com os ids do "Receber tudo"), o painel de estornos e as
 *   opções do painel de filtros — tudo sobre o recorte COMPLETO, nunca sobre a
 *   página aberta;
 * - `first_card`: a primeira página do primeiro cartão, o que a tela abre
 *   sozinha. Vem no MESMO documento porque o servidor calcula o recorte uma vez
 *   por requisição — pedir à parte custaria a conta de novo.
 *
 * As outras fábricas pedem as suas linhas quando o cartão é aberto (ver
 * `COMMISSIONS_FACTORY_ROWS_QUERY`). `latestReceiveDate` é medida antes do
 * recorte: é por ela que a tela sabe para que mês recuar.
 */
export const COMMISSIONS_QUERY = gql`
  ${COMMISSION_ROW}
  query Commissions($input: CommissionMonthInput!, $first: Int!) {
    commission_month: commissionMonth(input: $input) {
      latestReceiveDate
      hasMovement
      hasAnyCommission
      isFiltered
      scopeTotal
      totalCount
      monthTotals {
        receivable
        received
        pending
        countReceivable
        chargeback
        refund
      }
      split {
        company
        seller
        office
        margin
        count
      }
      groups {
        factoryId
        name
        count
        reconciledCount
        receivable
        received
        pending
        chargeback
        refund
        overdueCount
        receivableIds
      }
      chargebacks {
        ...CommissionRowFields
      }
      sellerMonthCommissions {
        sellerId
        amount
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
    }
    first_card: commissionMonthRows(input: $input, first: $first) {
      factoryId
      totalCount
      rows {
        ...CommissionRowFields
      }
    }
  }
`;

/**
 * Uma página das parcelas de UMA fábrica, no mesmo recorte de
 * `COMMISSIONS_QUERY` (o `input` é o mesmo): filtradas e ordenadas no servidor.
 */
export const COMMISSIONS_FACTORY_ROWS_QUERY = gql`
  ${COMMISSION_ROW}
  query CommissionsFactoryRows(
    $input: CommissionMonthInput!
    $factoryId: UUID!
    $first: Int!
    $offset: Int!
  ) {
    commission_month_rows: commissionMonthRows(
      input: $input
      factoryId: $factoryId
      first: $first
      offset: $offset
    ) {
      factoryId
      totalCount
      rows {
        ...CommissionRowFields
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
  ${COMMISSION_ROW}
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
        ...CommissionRowFields
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
