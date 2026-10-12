import type { Handler } from "./graphql";

/**
 * O servidor de comissões, para os specs.
 *
 * A tela mensal deixou de receber todas as parcelas e somar no navegador: ela
 * pede `commissionMonth` (os números prontos) e as linhas de cada fábrica em
 * páginas. Os specs continuam descrevendo o cenário pelas PARCELAS — é o que se
 * lê — e este arquivo faz o que o backend faria com elas: ótica, mês, situação,
 * filtros do painel, cartões por fábrica.
 *
 * Não é o motor de produção nem pretende ser: as regras de soma são provadas
 * no backend (`tests/modules/test_commission_month.py`). Aqui só há o bastante
 * para a tela ser exercitada de ponta a ponta.
 */

export interface CommissionRowLike {
  orderId: string;
  installmentId: string;
  invoiceNumber: string | null;
  paidAt: string | null;
  amount: string;
  status: string;
  receiveDate: string | null;
  isReconciled: boolean;
  isOverdue: boolean;
  defaultedAt: string | null;
  sellerAmount: string;
  sellerStatus: string;
  sellerReceiveDate: string | null;
  client: { razaoSocial: string } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    nickname?: string | null;
    razaoSocial: string;
  } | null;
  seller: { id: string; name: string } | null;
}

interface Options {
  /** Quem está logado é gestor (recebe os dois níveis e escolhe a ótica). */
  manager?: boolean;
  /** Data mais recente em que alguma comissão cai (antes do recorte). */
  latestReceiveDate?: string | null;
}

type Input = Record<string, string | null | undefined>;

const RECEIVABLE = ["receivable", "chargeback", "refund"];
const SELLER_PANEL = ["chargeback", "chargeback_settled", "refund"];
const STATUS_LABEL: Record<string, string> = {
  pending: "Previsto",
  receivable: "A receber",
  received: "Recebido",
  cancelled: "Cancelado",
  chargeback: "Estorno",
  chargeback_settled: "Estorno descontado",
  refund: "Devolução",
};

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0).toFixed(2);

function view<T extends CommissionRowLike>(
  rows: T[],
  input: Input,
  manager: boolean
) {
  const seller = manager && input.audience === "seller";
  const amount = (r: T) => Number(seller ? r.sellerAmount : r.amount);
  const date = (r: T) => (seller ? r.sellerReceiveDate : r.receiveDate);
  const status = (r: T) => (seller ? r.sellerStatus : r.status);
  const inMonth = (day: string | null) =>
    day !== null && day >= input.from! && day <= input.to!;

  const term = input.search?.trim().toLowerCase();
  const visible = rows.filter(
    (r) =>
      (!term ||
        (r.client?.razaoSocial ?? "").toLowerCase().includes(term) ||
        r.orderId.slice(0, 8).toLowerCase().includes(term) ||
        (r.invoiceNumber ?? "").toLowerCase().includes(term)) &&
      (!input.factoryId || r.factory?.id === input.factoryId) &&
      (!input.status || status(r) === input.status) &&
      (!input.reconciled || r.isReconciled === (input.reconciled === "yes")) &&
      // Só quando a tela soma a empresa inteira.
      (!(manager && !seller && input.panelSellerId) ||
        r.seller?.id === input.panelSellerId)
  );

  const tab = input.tab ?? "receivable";
  const byTab = (list: T[]) =>
    list.filter((r) => {
      if (tab === "overdue") return r.isOverdue || r.defaultedAt !== null;
      if (!inMonth(date(r))) return false;
      if (tab === "all") return true;
      if (tab === "receivable") return RECEIVABLE.includes(status(r));
      return status(r) === tab;
    });

  return {
    visible,
    filtered: byTab(visible),
    scopeTotal: byTab(rows).length,
    amount,
    date,
    status,
    inMonth,
  };
}

/**
 * `__typename`: a tela lê as parcelas por fragment (`CommissionRowFields`), e o
 * Apollo só casa o fragment com o tipo dito na resposta — sem ele a linha chega
 * vazia, como aconteceria com um backend que não mandasse o tipo.
 */
const typed = <T extends CommissionRowLike>(list: T[]) =>
  list.map((r) => ({ __typename: "CommissionRowType", ...r }));

const factoryName = (factory: CommissionRowLike["factory"]) =>
  factory?.nickname ?? factory?.nomeFantasia ?? factory?.razaoSocial ?? "—";

/** Os handlers `Commissions` e `CommissionsFactoryRows` para um conjunto de parcelas. */
export function commissionsBackend<T extends CommissionRowLike>(
  rows: T[],
  { manager = false, latestReceiveDate = "2026-08-09" }: Options = {}
): Record<string, Handler> {
  const groupsOf = (filtered: T[]) => {
    const byFactory = new Map<string, T[]>();
    filtered.forEach((r) => {
      const id = r.factory?.id ?? "sem-fabrica";
      byFactory.set(id, [...(byFactory.get(id) ?? []), r]);
    });
    return [...byFactory.entries()]
      .map(([factoryId, list]) => ({
        factoryId,
        name: factoryName(list[0].factory),
        list,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  };

  const page = (
    list: T[],
    first: number,
    offset: number,
    factoryId: string
  ) => ({
    factoryId,
    totalCount: list.length,
    rows: typed(list.slice(offset, offset + first)),
  });

  const options = (read: (r: T) => [string, string] | null) => {
    const seen = new Map<string, string>();
    rows.forEach((r) => {
      const entry = read(r);
      if (entry && !seen.has(entry[0])) seen.set(entry[0], entry[1]);
    });
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  };

  return {
    Commissions: (variables) => {
      const input = variables.input as Input;
      const v = view(rows, input, manager);
      const groups = groupsOf(v.filtered);
      const month = v.visible.filter((r) => v.inMonth(v.date(r)));
      const of = (list: T[], ...statuses: string[]) =>
        sum(list.filter((r) => statuses.includes(v.status(r))).map(v.amount));
      // A repartição é sempre do calendário do escritório (campos principais).
      const split = v.visible.filter(
        (r) =>
          v.inMonth(r.receiveDate) &&
          [...RECEIVABLE, "received"].includes(r.status)
      );
      const company = Number(sum(split.map((r) => Number(r.amount))));
      const sellerShare = Number(sum(split.map((r) => Number(r.sellerAmount))));
      const first = Number(variables.first ?? 50);

      return {
        commission_month: {
          latestReceiveDate,
          hasMovement: rows.some((r) => v.inMonth(r.receiveDate)),
          hasAnyCommission: rows.length > 0 || Boolean(latestReceiveDate),
          isFiltered: v.visible.length < rows.length,
          scopeTotal: v.scopeTotal,
          totalCount: v.filtered.length,
          monthTotals: {
            receivable: of(month, ...RECEIVABLE),
            received: of(month, "received"),
            pending: of(month, "pending"),
            countReceivable: month.filter((r) => v.status(r) === "receivable")
              .length,
            chargeback: of(month, "chargeback"),
            refund: of(month, "refund"),
          },
          split: {
            company: company.toFixed(2),
            seller: sellerShare.toFixed(2),
            office: (company - sellerShare).toFixed(2),
            margin: company !== 0 ? (company - sellerShare) / company : 0,
            count: split.length,
          },
          groups: groups.map((g) => ({
            factoryId: g.factoryId,
            name: g.name,
            count: g.list.length,
            reconciledCount: g.list.filter((r) => r.isReconciled).length,
            receivable: of(g.list, ...RECEIVABLE),
            received: of(g.list, "received"),
            pending: of(g.list, "pending"),
            chargeback: of(g.list, "chargeback"),
            refund: of(g.list, "refund"),
            overdueCount: g.list.filter(
              (r) => r.isOverdue || r.defaultedAt !== null
            ).length,
            receivableIds: g.list
              .filter((r) => ["receivable", "refund"].includes(r.status))
              .map((r) => r.installmentId),
          })),
          chargebacks: typed(
            v.visible.filter((r) => SELLER_PANEL.includes(r.sellerStatus))
          ),
          sellerMonthCommissions: [],
          factoryOptions: options((r) =>
            r.factory ? [r.factory.id, factoryName(r.factory)] : null
          ),
          sellerOptions: options((r) =>
            r.seller ? [r.seller.id, r.seller.name] : null
          ),
          statusOptions: options((r) => [
            v.status(r),
            STATUS_LABEL[v.status(r)] ?? v.status(r),
          ]),
        },
        first_card: groups.length
          ? page(groups[0].list, first, 0, groups[0].factoryId)
          : { factoryId: null, totalCount: 0, rows: [] },
      };
    },

    CommissionsFactoryRows: (variables) => {
      const v = view(rows, variables.input as Input, manager);
      const factoryId = String(variables.factoryId);
      const group = groupsOf(v.filtered).find((g) => g.factoryId === factoryId);
      return {
        commission_month_rows: page(
          group?.list ?? [],
          Number(variables.first ?? 50),
          Number(variables.offset ?? 0),
          factoryId
        ),
      };
    },
  };
}
