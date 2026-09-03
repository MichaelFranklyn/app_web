import { clientName } from "@/utils/company";
import { formatDateDMY } from "@/utils/format/masks";
import { isInMonth, type YearMonth } from "@/utils/format/month";
import { CommissionRow, CommissionStatus } from "./interface";

// O vocabulário da situação e o agrupamento por fábrica subiram para
// `(inside)/_shared/commissions` quando o relatório de comissões passou a
// precisar deles — o papel e a tela têm de chamar a mesma coisa pelo mesmo nome.
// Re-exportados aqui porque a página inteira já os consome por este arquivo.
import { groupByFactory } from "../../_shared/commissions";

export {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_TONE,
  groupByFactory,
} from "../../_shared/commissions";

/** O grupo desta página é sempre de linhas de comissão — o genérico fica no pai. */
export type FactoryGroup =
  import("../../_shared/commissions").FactoryGroup<CommissionRow>;

export type CommissionTab =
  | "receivable"
  | "pending"
  | "received"
  | "overdue"
  | "all";

export const COMMISSION_TABS: { id: CommissionTab; label: string }[] = [
  { id: "receivable", label: "A receber" },
  { id: "pending", label: "Previsto" },
  { id: "received", label: "Recebido" },
  { id: "overdue", label: "Boleto em atraso" },
  { id: "all", label: "Todas" },
];

/** O que compõe o próximo fechamento: entradas e saídas, no líquido. */
const RECEIVABLE_STATUSES: CommissionStatus[] = [
  "receivable",
  // Estorno a descontar e devolução a receber saem do mesmo bolso e no mesmo
  // mês do que há a receber — separá-los em abas faria o gestor somar de
  // cabeça para saber quanto cai.
  "chargeback",
  "refund",
];

/**
 * Recorta as linhas pela situação escolhida.
 *
 * "Boleto em atraso" não é um status de comissão e sim do BOLETO: junta o
 * vencido não pago com o calote confirmado, que é o que está travando o
 * dinheiro. As demais abas continuam filtrando pelo status da comissão.
 */
export const filterByTab = (
  rows: CommissionRow[],
  tab: CommissionTab
): CommissionRow[] => {
  if (tab === "all") return rows;
  if (tab === "overdue")
    return rows.filter((row) => row.isOverdue || row.defaultedAt !== null);
  if (tab === "receivable")
    return rows.filter((row) => RECEIVABLE_STATUSES.includes(row.status));
  return rows.filter((row) => row.status === tab);
};

/**
 * Recorta pelo mês escolhido — exceto em "Boleto em atraso".
 *
 * Nas abas de comissão o mês É o assunto: elas respondem "quanto cai neste
 * fechamento", e a data que importa é a de recebimento.
 *
 * Atraso não é evento de mês, é acúmulo. E a conferência do que o cliente não
 * pagou é feita contra o relatório que a fábrica manda — que vem com boletos de
 * vencimentos espalhados, não de um mês só. Recortando por mês, o gestor teria
 * de descobrir os meses de vencimento um a um e marcar um lote em cada: quatro
 * navegações para um relatório só. Aqui a aba mostra tudo o que está travado.
 */
export const filterByMonth = (
  rows: CommissionRow[],
  month: YearMonth,
  tab: CommissionTab
): CommissionRow[] =>
  tab === "overdue"
    ? rows
    : rows.filter((row) => isInMonth(row.receiveDate, month));

// A navegação por mês virou coisa de duas telas (comissões e metas) e mora em
// @/utils/format/month. Re-exportado aqui porque a página inteira já a consome
// por este arquivo — o importante é existir uma implementação só.
export {
  addMonths,
  isInMonth,
  monthEndIso,
  monthLabel,
  monthStartIso,
  yearMonthFromIso,
  type YearMonth,
} from "@/utils/format/month";

export interface MonthSummary {
  receivable: number; // a receber no mês, JÁ LÍQUIDO dos estornos
  received: number; // já recebido no mês
  pending: number; // previsto no mês (depende de faturamento/pagamento)
  countReceivable: number; // parcelas a receber no mês
  chargeback: number; // estornos (negativo) que caem no mês
  refund: number; // devoluções (positivo) que voltam no mês
}

/**
 * Consolida as comissões de UM mês (pela data em que a comissão cai,
 * `receiveDate`) somando todas as fábricas — é o "quanto o vendedor vai receber
 * em agosto". Linhas previstas sem data de recebimento entram como previsto.
 */
export const summarizeMonth = (
  rows: CommissionRow[],
  month: YearMonth
): MonthSummary => {
  const summary: MonthSummary = {
    receivable: 0,
    received: 0,
    pending: 0,
    countReceivable: 0,
    chargeback: 0,
    refund: 0,
  };
  for (const row of rows) {
    if (!isInMonth(row.receiveDate, month)) continue;
    if (row.status === "receivable") {
      summary.receivable += Number(row.amount);
      summary.countReceivable += 1;
    } else if (row.status === "received") {
      summary.received += Number(row.amount);
    } else if (row.status === "pending") {
      summary.pending += Number(row.amount);
    } else if (row.status === "chargeback") {
      // Estorno já vem negativo: entra no a receber para o mês fechar líquido.
      summary.chargeback += Number(row.amount);
      summary.receivable += Number(row.amount);
    } else if (row.status === "refund") {
      summary.refund += Number(row.amount);
      summary.receivable += Number(row.amount);
    }
  }
  return summary;
};

// ── Relatório do mês (PDF) ───────────────────────────────────────────────────

/** Parcelas de uma fábrica numa seção do papel, com o subtotal dela. */
export interface CommissionFactoryGroup {
  factoryId: string;
  name: string;
  /** Da mais próxima para a mais distante; no empate, por cliente. */
  rows: CommissionRow[];
  subtotal: number;
}

/** Uma seção do relatório (a receber, recebido, previsto). */
export interface CommissionSection {
  groups: CommissionFactoryGroup[];
  total: number;
  count: number;
}

export interface MonthReport {
  /** O que a fábrica ainda deve no mês, já líquido de estorno e devolução. */
  receivable: CommissionSection;
  /** O que a fábrica já repassou no mês. */
  received: CommissionSection;
  /** O que ainda depende de faturamento ou de o cliente pagar. */
  pending: CommissionSection;
  /**
   * Boletos em calote confirmado — de TODOS os vencimentos, não só do mês.
   * Calote não é evento de mês: ele fica travado até ser resolvido, e a
   * conferência é feita contra um relatório da fábrica que mistura vencimentos.
   */
  defaulted: CommissionRow[];
  /** Boletos que o cliente pagou DENTRO do mês (o que foi liquidado). */
  settled: CommissionRow[];
  /** A receber + recebido: o que o mês vale. Previsto fica de fora. */
  total: number;
  /** Quantas parcelas de comissão o papel lista nas três primeiras seções. */
  count: number;
}

/**
 * Ordena para a conferência: pela data em que a comissão cai (as sem data por
 * último) e, no empate, por cliente — a mesma leitura da planilha da fábrica.
 */
const byReceiveDate = (a: CommissionRow, b: CommissionRow): number =>
  (a.receiveDate ?? "9999-12-31").localeCompare(
    b.receiveDate ?? "9999-12-31"
  ) || clientName(a.client).localeCompare(clientName(b.client), "pt-BR");

/** Agrupa por fábrica e soma cada grupo — a fábrica é a unidade de cobrança. */
const sectionOf = (rows: CommissionRow[]): CommissionSection => {
  const groups = groupByFactory(rows).map((group) => ({
    factoryId: group.factoryId,
    name: group.name,
    rows: [...group.rows].sort(byReceiveDate),
    subtotal: group.rows.reduce((sum, row) => sum + Number(row.amount), 0),
  }));

  return {
    groups,
    total: groups.reduce((sum, group) => sum + group.subtotal, 0),
    count: rows.length,
  };
};

/** Situações que compõem o "a receber" do mês (entradas e saídas, no líquido). */
const isReceivableStatus = (row: CommissionRow): boolean =>
  RECEIVABLE_STATUSES.includes(row.status);

/**
 * O fechamento do mês em cinco seções — é o papel que se põe ao lado da
 * planilha da fábrica.
 *
 * As três primeiras são de COMISSÃO e seguem a data em que ela cai: o que há a
 * receber, o que já entrou e o que ainda depende de alguém fazer alguma coisa.
 * As duas últimas são do BOLETO DO CLIENTE, que é outra pergunta — quem pagou e
 * quem não pagou —, e é por isso que elas têm recorte próprio: os liquidados
 * são os pagos DENTRO do mês; os inadimplentes vêm de todos os vencimentos,
 * porque calote não vence e nem se resolve dentro de um mês.
 */
export const monthReport = (
  rows: CommissionRow[],
  month: YearMonth
): MonthReport => {
  const inMonth = rows.filter((row) => isInMonth(row.receiveDate, month));

  const receivable = sectionOf(inMonth.filter(isReceivableStatus));
  const received = sectionOf(
    inMonth.filter((row) => row.status === "received")
  );
  const pending = sectionOf(inMonth.filter((row) => row.status === "pending"));

  const defaulted = rows
    .filter((row) => row.defaultedAt !== null)
    .sort((a, b) =>
      (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31")
    );

  const settled = rows
    .filter((row) => isInMonth(row.paidAt, month))
    .sort((a, b) => (a.paidAt ?? "").localeCompare(b.paidAt ?? ""));

  return {
    receivable,
    received,
    pending,
    defaulted,
    settled,
    // Previsto não entra: ele ainda não é dinheiro de ninguém, e somá-lo aqui
    // faria o papel prometer um mês maior do que o que a fábrica vai pagar.
    total: receivable.total + received.total,
    count: receivable.count + received.count + pending.count,
  };
};

// ── Situação do boleto do cliente ────────────────────────────────────────────

/**
 * O que aconteceu com o boleto, em uma linha.
 *
 * É outra pergunta que a situação da COMISSÃO: um boleto vencido pode ter
 * comissão a receber (modo Faturamento) e um boleto pago pode ter comissão
 * ainda prevista. O calote vem primeiro porque é o estado que manda — e a data
 * anda junto do rótulo porque quem confere precisa saber *quando*, não só *o
 * quê*.
 */
export const boletoLabel = (row: CommissionRow): string => {
  if (row.defaultedAt) return `Não pagou ${formatDateDMY(row.defaultedAt)}`;
  if (row.paidAt) return `Pago ${formatDateDMY(row.paidAt)}`;
  if (row.isOverdue && row.dueDate)
    return `Vencido ${formatDateDMY(row.dueDate)}`;
  return row.dueDate ? `Vence ${formatDateDMY(row.dueDate)}` : "—";
};

// ── Repartição da comissão entre escritório e vendedor ───────────────────────

export interface OfficeSplit {
  /** O que a FÁBRICA paga ao escritório no mês. */
  company: number;
  /** A fatia que o escritório repassa ao vendedor dessas mesmas parcelas. */
  seller: number;
  /** O que sobra para o escritório. */
  office: number;
  /** Fatia do escritório sobre a comissão da fábrica (0 a 1). */
  margin: number;
  count: number;
}

/**
 * Quanto da comissão do mês fica com o escritório.
 *
 * São dois acordos empilhados: a fábrica paga uma comissão ao escritório, e o
 * vendedor tem a taxa dele sobre o pedido (ver `seller_commission_rate`), que
 * sai de dentro dessa comissão.
 * Sem esta conta o gestor só enxerga o número de cima e trata o repasse como se
 * não existisse.
 *
 * Mede as duas pontas sobre as MESMAS parcelas — as cujo repasse da fábrica cai
 * no mês —, e não cada uma pelo seu próprio calendário: o vendedor pode ser
 * pago num mês diferente, e comparar dois conjuntos daria uma sobra que não é
 * de ninguém. Só vale para quem vê o nível do escritório (gestor); na visão do
 * vendedor `amount` JÁ é a fatia dele, e a diferença daria zero.
 */
export const officeSplit = (
  rows: CommissionRow[],
  month: YearMonth
): OfficeSplit => {
  const scope = rows.filter(
    (row) =>
      isInMonth(row.receiveDate, month) &&
      (isReceivableStatus(row) || row.status === "received")
  );

  const company = scope.reduce((sum, row) => sum + Number(row.amount), 0);
  const seller = scope.reduce((sum, row) => sum + Number(row.sellerAmount), 0);

  return {
    company,
    seller,
    office: company - seller,
    // Mês sem comissão nenhuma não tem margem: 0 é melhor que uma divisão por
    // zero virando "Infinity%" na tela.
    margin: company !== 0 ? (company - seller) / company : 0,
    count: scope.length,
  };
};

export interface RowsSummary {
  receivable: number; // soma a receber, JÁ LÍQUIDA dos estornos
  received: number; // soma recebida
  pending: number; // soma prevista (depende de faturamento/pagamento)
  chargeback: number; // soma dos estornos (negativa)
  refund: number; // soma das devoluções (positiva)
  reconciledCount: number; // quantas parcelas já foram conferidas
  receivableIds: string[]; // parcelas a receber (para "Receber tudo")
  overdueCount: number; // boletos vencidos ou em calote
}

/**
 * Subtotais de um conjunto de linhas (já recortado por fábrica e pelos filtros):
 * o que há a receber, o que já veio, quantas foram conferidas e os ids a receber
 * para o repasse em massa.
 */
export const summarizeRows = (rows: CommissionRow[]): RowsSummary => {
  const summary: RowsSummary = {
    receivable: 0,
    received: 0,
    pending: 0,
    chargeback: 0,
    refund: 0,
    reconciledCount: 0,
    receivableIds: [],
    overdueCount: 0,
  };
  for (const row of rows) {
    if (row.status === "receivable") {
      summary.receivable += Number(row.amount);
      summary.receivableIds.push(row.installmentId);
    }
    if (row.status === "received") summary.received += Number(row.amount);
    if (row.status === "pending") summary.pending += Number(row.amount);
    if (row.status === "chargeback") {
      summary.chargeback += Number(row.amount);
      summary.receivable += Number(row.amount);
    }
    // Devolução é positiva: o cliente pagou depois de o desconto ter saído, e o
    // valor volta pelo mesmo fechamento. Estorno JÁ descontado não entra em
    // conta nenhuma — ele pesou no mês em que saiu e virou histórico.
    if (row.status === "refund") {
      summary.refund += Number(row.amount);
      summary.receivable += Number(row.amount);
      summary.receivableIds.push(row.installmentId);
    }
    if (row.isReconciled) summary.reconciledCount += 1;
    if (row.isOverdue || row.defaultedAt) summary.overdueCount += 1;
  }
  return summary;
};

export interface FactoryHighlight {
  label: string;
  value: number;
  color?: "amber" | "green" | "red";
}

/**
 * Os valores que o cabeçalho do cartão da fábrica destaca, conforme a situação
 * escolhida nos filtros. Com "A receber" ligado, um "Recebido R$ 0,00" ao lado
 * era só ruído — o cartão mostra o número que o filtro pediu.
 */
export const factoryHighlights = (
  summary: RowsSummary,
  tab: CommissionTab
): FactoryHighlight[] => {
  switch (tab) {
    case "receivable": {
      const destaques: FactoryHighlight[] = [
        { label: "A receber", value: summary.receivable, color: "amber" },
      ];
      // O líquido sozinho esconde o que o compõe: com estorno ou devolução no
      // mês, o gestor precisa ver de onde veio a diferença antes de cobrar.
      if (summary.chargeback !== 0)
        destaques.push({
          label: "Estorno",
          value: summary.chargeback,
          color: "red",
        });
      if (summary.refund !== 0)
        destaques.push({
          label: "Devolução",
          value: summary.refund,
          color: "green",
        });
      return destaques;
    }
    case "received":
      return [{ label: "Recebido", value: summary.received, color: "green" }];
    case "pending":
      return [{ label: "Previsto", value: summary.pending }];
    case "overdue":
      return [{ label: "Estorno", value: summary.chargeback, color: "red" }];
    default:
      return [
        { label: "A receber", value: summary.receivable, color: "amber" },
        { label: "Recebido", value: summary.received, color: "green" },
      ];
  }
};

// ── Impacto de marcar um lote como calote ────────────────────────────────────

export interface SellerImpact {
  sellerId: string;
  name: string;
  /** Quanto será recuperado deste vendedor (positivo). */
  amount: number;
  /** Comissão dele no mês aberto, antes do desconto. */
  monthCommission: number;
  /** Fatia do mês que o desconto consome (1 = o mês inteiro). */
  share: number;
}

export interface DefaultImpact {
  /** Comissão já recebida da fábrica que volta como estorno (positivo). */
  factoryChargeback: number;
  /** Quantas das parcelas escolhidas ainda não tinham gerado comissão paga. */
  withoutDebt: number;
  sellers: SellerImpact[];
}

/**
 * O que acontece se estas parcelas forem marcadas como calote.
 *
 * Serve para o gestor decidir com o número na frente, e não descobrir depois:
 * quanto volta para a fábrica, de quem o escritório precisa recuperar e —
 * principalmente — que fatia do mês daquele vendedor o desconto consome. Um
 * calote de seis parcelas pode passar do mês inteiro dele.
 *
 * `allRows` é a lista completa (todos os meses, todas as fábricas): a comissão
 * do mês do vendedor não cabe no recorte da fábrica que está sendo conferida.
 */
export const defaultImpact = (
  selected: CommissionRow[],
  allRows: CommissionRow[],
  month: YearMonth
): DefaultImpact => {
  const factoryChargeback = selected
    .filter((row) => row.isReceived)
    .reduce((sum, row) => sum + Number(row.amount), 0);

  const porVendedor = new Map<string, SellerImpact>();
  for (const row of selected) {
    // Só quem já recebeu a fatia tem o que devolver; para o resto o calote
    // apenas cancela uma comissão que nunca chegou.
    if (!row.isSellerPaid || !row.seller) continue;
    const atual = porVendedor.get(row.seller.id);
    const amount = Math.abs(Number(row.sellerAmount));
    if (atual) {
      atual.amount += amount;
      continue;
    }
    // A comissão DO VENDEDOR no mês: soma `sellerAmount` pela data DELE
    // (`sellerReceiveDate`). Usar os campos principais mediria o estorno do
    // vendedor contra o fechamento do escritório — dois números diferentes.
    const monthCommission = allRows
      .filter(
        (r) =>
          r.seller?.id === row.seller!.id &&
          isInMonth(r.sellerReceiveDate, month) &&
          (r.sellerStatus === "receivable" ||
            r.sellerStatus === "chargeback" ||
            r.sellerStatus === "refund")
      )
      .reduce((sum, r) => sum + Number(r.sellerAmount), 0);
    porVendedor.set(row.seller.id, {
      sellerId: row.seller.id,
      name: row.seller.name,
      amount,
      monthCommission,
      share: 0,
    });
  }

  const sellers = [...porVendedor.values()].map((item) => ({
    ...item,
    // Mês sem comissão nenhuma: o desconto é maior que tudo o que há, e
    // dividir por zero daria Infinity na tela.
    share: item.monthCommission > 0 ? item.amount / item.monthCommission : 1,
  }));

  return {
    factoryChargeback: Math.abs(factoryChargeback),
    withoutDebt: selected.filter((row) => !row.isReceived).length,
    sellers,
  };
};
