import { clientName } from "@/utils/company";
import { formatDateDMY } from "@/utils/format/masks";
import {
  addMonths,
  isInMonth,
  monthEndIso,
  monthStartIso,
  type YearMonth,
} from "@/utils/format/month";
import {
  CommissionMonthData,
  CommissionMonthGroupData,
  CommissionRow,
  CommissionStatus,
} from "./interface";

// O vocabulário da situação e o agrupamento por fábrica subiram para
// `(inside)/_shared/commissions` quando o relatório de comissões passou a
// precisar deles — o papel e a tela têm de chamar a mesma coisa pelo mesmo nome.
// Re-exportados aqui porque a página inteira já os consome por este arquivo.
import {
  groupByFactory,
  OFFICE_LENS,
  type CommissionLens,
} from "../../_shared/commissions";

export {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_TONE,
  groupByFactory,
} from "../../_shared/commissions";

/**
 * O cartão de uma fábrica: o resumo de TODAS as parcelas dela no recorte, já
 * somado no servidor. As linhas não moram aqui — o cartão pede as suas, uma
 * página por vez (ver `useFactoryRows`).
 */
export interface FactoryGroup {
  factoryId: string;
  name: string;
  /** Quantas parcelas a fábrica tem no recorte (todas as páginas). */
  count: number;
  summary: RowsSummary;
}

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

// A navegação por mês virou coisa de duas telas (comissões e metas) e mora em
// @/utils/format/month. Re-exportado aqui porque a página inteira já a consome
// por este arquivo — o importante é existir uma implementação só.
export {
  addMonths,
  isBeforeMonth,
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
 * Os três cartões do mês, como o servidor os somou (`commissionMonth`).
 *
 * A soma é do recorte COMPLETO — mês, ótica e filtros do painel —, nunca da
 * página aberta. O servidor manda decimais em texto; aqui viram número uma vez
 * só, para o resto da tela não repetir a conversão.
 */
export const monthSummaryFromServer = (
  totals?: CommissionMonthData["monthTotals"]
): MonthSummary => ({
  receivable: Number(totals?.receivable ?? 0),
  received: Number(totals?.received ?? 0),
  pending: Number(totals?.pending ?? 0),
  countReceivable: totals?.countReceivable ?? 0,
  chargeback: Number(totals?.chargeback ?? 0),
  refund: Number(totals?.refund ?? 0),
});

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

/**
 * O que já está marcado para cair no mês SEGUINTE.
 *
 * O fechamento responde "quanto entra neste mês", e quem vive de comissão faz a
 * pergunta seguinte na mesma hora: e no mês que vem? O dado já existe — as
 * comissões nascem com data de recebimento no faturamento, então boa parte do
 * próximo mês já está lançada quando este fecha. Sem isto, o vendedor só
 * descobre o tamanho do mês quando ele chega.
 *
 * `receivable` é o que a fábrica já deve; `pending` continua fora dele, pela
 * mesma razão do total do mês (depende de faturar ou de o cliente pagar).
 */
export interface NextMonthPreview {
  month: YearMonth;
  /** Firme: a fábrica já deve, é só a data chegar. */
  receivable: number;
  /** Ainda depende de alguém fazer alguma coisa — não soma com o firme. */
  pending: number;
  /** Quantas parcelas compõem as duas pontas. */
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
  /** Prévia do próximo fechamento — ver `NextMonthPreview`. */
  next: NextMonthPreview;
}

// A ótica do papel (escritório × vendedor) subiu para
// `(inside)/_shared/commissions` quando o relatório do período passou a emitir
// os mesmos dois papéis: o gestor põe as duas folhas lado a lado, e uma ótica
// definida duas vezes é uma ótica que diverge. Re-exportada aqui porque a
// página inteira já a consome por este arquivo.
export {
  lensFor,
  OFFICE_LENS,
  OWN_SELLER_LENS,
  SELLER_LENS,
  type CommissionAudience,
  type CommissionLens,
} from "../../_shared/commissions";

/**
 * Ordena para a conferência: pela data em que a comissão cai (as sem data por
 * último) e, no empate, por cliente — a mesma leitura da planilha da fábrica.
 *
 * Recebe a lente porque a data que ordena é a da ótica: no papel do vendedor as
 * linhas seguem o calendário DELE, senão a ordem não bate com os valores da
 * coluna ao lado.
 */
const byReceiveDateWith =
  (lens: CommissionLens) =>
  (a: CommissionRow, b: CommissionRow): number =>
    (lens.receiveDate(a) ?? "9999-12-31").localeCompare(
      lens.receiveDate(b) ?? "9999-12-31"
    ) || clientName(a.client).localeCompare(clientName(b.client), "pt-BR");

/** Agrupa por fábrica e soma cada grupo — a fábrica é a unidade de cobrança. */
const sectionOf = (
  rows: CommissionRow[],
  lens: CommissionLens
): CommissionSection => {
  const groups = groupByFactory(rows).map((group) => ({
    factoryId: group.factoryId,
    name: group.name,
    rows: [...group.rows].sort(byReceiveDateWith(lens)),
    subtotal: group.rows.reduce((sum, row) => sum + lens.amount(row), 0),
  }));

  return {
    groups,
    total: groups.reduce((sum, group) => sum + group.subtotal, 0),
    count: rows.length,
  };
};

/** Situações que compõem o "a receber" do mês (entradas e saídas, no líquido). */
const isReceivableStatus = (
  row: CommissionRow,
  lens: CommissionLens
): boolean => RECEIVABLE_STATUSES.includes(lens.status(row));

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
  month: YearMonth,
  lens: CommissionLens = OFFICE_LENS
): MonthReport => {
  const inMonth = rows.filter((row) => isInMonth(lens.receiveDate(row), month));

  const receivable = sectionOf(
    inMonth.filter((row) => isReceivableStatus(row, lens)),
    lens
  );
  const received = sectionOf(
    inMonth.filter((row) => lens.status(row) === "received"),
    lens
  );
  const pending = sectionOf(
    inMonth.filter((row) => lens.status(row) === "pending"),
    lens
  );

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
    next: nextMonthPreview(rows, month, lens),
  };
};

/**
 * O que as MESMAS linhas já prometem para o mês seguinte.
 *
 * Sai das linhas inteiras, e não das do mês: o papel busca a carteira toda do
 * vendedor (ver `COMMISSIONS_PDF_QUERY`), então o próximo fechamento já está
 * ali dentro. "Recebido" não entra — comissão recebida num mês que ainda nem
 * começou seria erro de lançamento, não previsão.
 */
/**
 * O recorte que o PDF do mês pede ao servidor — tudo o que `monthReport` lê, e
 * nada além: a comissão que cai no mês ou no seguinte (pela data de quem olha
 * OU do vendedor, o servidor traz as duas), o boleto pago no mês e o calote
 * (sempre, via `includeDefaulted` na própria query).
 */
export const pdfVariables = (sellerId: string | null, month: YearMonth) => ({
  sellerId,
  from: monthStartIso(month),
  to: monthEndIso(addMonths(month, 1)),
  paidFrom: monthStartIso(month),
  paidTo: monthEndIso(month),
});

export const nextMonthPreview = (
  rows: CommissionRow[],
  month: YearMonth,
  lens: CommissionLens = OFFICE_LENS
): NextMonthPreview => {
  const next = addMonths(month, 1);
  const inNext = rows.filter((row) => isInMonth(lens.receiveDate(row), next));
  const receivable = inNext.filter((row) => isReceivableStatus(row, lens));
  const pending = inNext.filter((row) => lens.status(row) === "pending");
  const sum = (list: CommissionRow[]) =>
    list.reduce((total, row) => total + lens.amount(row), 0);

  return {
    month: next,
    receivable: sum(receivable),
    pending: sum(pending),
    count: receivable.length + pending.length,
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
 * Quanto da comissão do mês fica com o escritório, como o servidor mediu.
 *
 * São dois acordos empilhados: a fábrica paga uma comissão ao escritório, e o
 * vendedor tem a taxa dele sobre o pedido (ver `seller_commission_rate`), que
 * sai de dentro dessa comissão.
 *
 * O servidor mede as duas pontas sobre as MESMAS parcelas — as cujo repasse da
 * fábrica cai no mês, sempre no calendário do ESCRITÓRIO —, e não cada uma pelo
 * seu próprio calendário: o vendedor pode ser pago num mês diferente, e
 * comparar dois conjuntos daria uma sobra que não é de ninguém.
 */
export const officeSplitFromServer = (
  split?: CommissionMonthData["split"]
): OfficeSplit => ({
  company: Number(split?.company ?? 0),
  seller: Number(split?.seller ?? 0),
  office: Number(split?.office ?? 0),
  margin: split?.margin ?? 0,
  count: split?.count ?? 0,
});

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
 * O cartão de uma fábrica, como o servidor o resumiu.
 *
 * Os VALORES seguem a ótica (de quem é o dinheiro que o cartão destaca); os
 * IDS, não — eles alimentam "Receber tudo desta fábrica", que marca que a
 * FÁBRICA pagou e é sempre do nível do escritório. E vêm de todas as parcelas
 * da fábrica no recorte, não só das que estão na página aberta.
 */
export const factoryGroupFromServer = (
  group: CommissionMonthGroupData
): FactoryGroup => ({
  factoryId: group.factoryId,
  name: group.name,
  count: group.count,
  summary: {
    receivable: Number(group.receivable),
    received: Number(group.received),
    pending: Number(group.pending),
    chargeback: Number(group.chargeback),
    refund: Number(group.refund),
    reconciledCount: group.reconciledCount,
    receivableIds: group.receivableIds,
    overdueCount: group.overdueCount,
  },
});

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
 * `monthBySeller` é a comissão de cada vendedor no mês aberto, somada no
 * servidor pelo calendário DELE (`sellerMonthCommissions`): ela não cabe nas
 * linhas da fábrica que está sendo conferida, nem na página aberta.
 */
export const defaultImpact = (
  selected: CommissionRow[],
  monthBySeller: Record<string, number>
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
    // A comissão DO VENDEDOR no mês, pela data DELE (`sellerReceiveDate`).
    // Medir contra o fechamento do escritório compararia dois números
    // diferentes.
    const monthCommission = monthBySeller[row.seller.id] ?? 0;
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

// ── Alcance da seleção em lote ───────────────────────────────────────────────

export interface SelectionScope {
  /** Linha curta da barra de ações: de onde é o lote e quanto dele foi marcado. */
  label: string;
  /** Frase do modal de confirmação: o que a ação vai alcançar. */
  sentence: string;
}

/**
 * De onde é o lote marcado e até onde ele vai, por extenso.
 *
 * As parcelas de uma fábrica vêm em páginas, e a seleção ACUMULA entre elas: dá
 * para ter 62 marcadas com 50 na tela. Antes de uma ação em lote o alcance
 * precisa estar escrito — a fábrica, o recorte, quantas das parcelas dela
 * entram e quantas delas não estão à vista.
 */
export const selectionScope = ({
  factoryName,
  periodLabel,
  selected,
  total,
  offPage,
}: {
  factoryName: string | null;
  /** "agosto de 2026" ou, na aba que ignora o mês, "todos os vencimentos". */
  periodLabel: string;
  selected: number;
  /** Parcelas da fábrica no recorte (todas as páginas). */
  total: number;
  /** Quantas das marcadas estão em páginas que não a aberta. */
  offPage: number;
}): SelectionScope => {
  if (!factoryName || selected === 0) {
    return { label: periodLabel, sentence: "" };
  }
  const where = `${factoryName} · ${periodLabel}`;
  const share =
    total > selected
      ? `${selected} de ${total} parcelas desta fábrica`
      : "todas as parcelas desta fábrica";
  const elsewhere =
    offPage > 0
      ? ` · ${offPage} ${offPage === 1 ? "está" : "estão"} em outra página`
      : "";
  return {
    label: `${where} · ${share}${elsewhere}`,
    sentence:
      `Esta ação vale para ${selected === 1 ? "a parcela selecionada" : `as ${selected} parcelas selecionadas`} de ${factoryName} (${periodLabel})` +
      (offPage > 0
        ? ` — ${offPage} ${offPage === 1 ? "delas não está" : "delas não estão"} na página aberta.`
        : "."),
  };
};
