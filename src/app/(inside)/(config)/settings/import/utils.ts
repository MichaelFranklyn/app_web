import {
  Building2,
  ClipboardList,
  Package,
  UserCog,
  Users,
} from "lucide-react";

import {
  CompanySetupProgress,
  SetupFactory,
  SetupStep,
  SetupStepContent,
  SetupStepKey,
  HistoryOrderStatus,
  HistoryResult,
  HistoryRowInput,
} from "./interface";
import { plural } from "@/utils/format/plural";

/**
 * A ordem é a do backend (`steps`), e ela importa: a fábrica pede os
 * vendedores que a atendem, a tabela é da fábrica, e o histórico só casa com
 * clientes e fábricas que já estão aqui.
 */
export const SETUP_STEP_CONTENT: Record<SetupStepKey, SetupStepContent> = {
  SELLERS: {
    icon: UserCog,
    title: "Vendedores",
    description:
      "Cadastre a equipe de uma vez, por planilha. O email de acesso só sai quando você concluir a configuração — ninguém entra num sistema pela metade.",
    href: "/settings/users",
    action: "Ver pessoas",
  },
  FACTORIES: {
    icon: Building2,
    title: "Fábricas",
    description:
      "Vincule as fábricas que você representa e, em cada uma, informe a comissão, o prazo de pagamento e os vendedores que atendem.",
    href: "/factories",
    action: "Ir para Fábricas",
  },
  PRICE_LISTS: {
    icon: Package,
    title: "Tabelas de preço",
    description:
      "Em cada fábrica, aba Tabelas → Mais ações → Importar tabela. Os produtos entram junto com os preços, e os pedidos novos já saem com ela.",
    href: "/factories",
    // O botão diz a tarefa, não o lugar: dois passos seguidos com "Ir para
    // Fábricas" pareciam repetidos (crítica de configurações, 23/11/2026). A
    // descrição acima diz onde, dentro da fábrica, fica a importação.
    action: "Importar tabela de preço",
  },
  CLIENTS: {
    icon: Users,
    title: "Clientes",
    description:
      "Suba a lista de clientes do sistema antigo. Basta a coluna do CNPJ: o resto vem da Receita.",
    href: "/clients",
    action: "Ir para Clientes",
  },
  ORDER_HISTORY: {
    icon: ClipboardList,
    title: "Histórico de pedidos",
    description:
      "Os pedidos antigos ensinam ao sistema o ritmo de compra de cada cliente. Com eles, a rotina e o estoque estimado já funcionam no primeiro dia.",
    href: "/settings/import/orders",
    action: "Importar histórico",
  },
};

/**
 * O passo obrigatório anterior que ainda falta — e que trava este. `null`
 * quando o passo está liberado.
 *
 * Só o obrigatório trava: clientes é opcional e não segura o histórico, que
 * pode criar o cliente que falta pelo CNPJ.
 */
export const blockingStep = <K extends string = SetupStepKey>(
  steps: (Omit<SetupStep, "key"> & { key: K })[],
  index: number
): K | null =>
  steps.slice(0, index).find((s) => s.isRequired && !s.isDone)?.key ?? null;

/** A linha de situação de cada passo, a partir das contagens do progresso. */
export const stepSummary = (
  key: SetupStepKey,
  progress: CompanySetupProgress
): string => {
  const factories = progress.factories;
  switch (key) {
    case "SELLERS":
      return plural(
        progress.sellersCount,
        "vendedor cadastrado",
        "vendedores cadastrados"
      );
    case "FACTORIES":
      return factories.length === 0
        ? "Nenhuma fábrica vinculada"
        : `${factories.filter((f) => f.isConfigured).length} de ${factories.length} fábricas prontas`;
    case "PRICE_LISTS":
      return factories.length === 0
        ? "Vincule as fábricas primeiro"
        : `${factories.filter((f) => f.hasPriceList).length} de ${factories.length} fábricas com tabela`;
    case "CLIENTS":
      return plural(
        progress.clientsCount,
        "cliente na carteira",
        "clientes na carteira"
      );
    case "ORDER_HISTORY":
      return progress.historyOrdersCount === 0
        ? "Nenhum pedido antigo importado"
        : plural(
            progress.historyOrdersCount,
            "pedido importado",
            "pedidos importados"
          );
  }
};

/**
 * O que ainda falta numa fábrica, na ordem em que se resolve, com a aba que
 * resolve. `null` quando ela está pronta.
 */
export const factoryPendingItem = (
  factory: SetupFactory
): { label: string; href: string } | null => {
  const base = `/factories/${factory.companyFactoryId}`;
  if (factory.paymentTermsCount === 0)
    return {
      label: "Falta o prazo de pagamento",
      href: `${base}/payment-terms`,
    };
  if (factory.sellersCount === 0)
    return { label: "Faltam os vendedores", href: `${base}/sellers` };
  if (!factory.hasPriceList)
    return { label: "Falta a tabela de preço", href: `${base}/price-lists` };
  return null;
};

/** Os status daqui, para casar com os status escritos na planilha. */
export const STATUS_OPTIONS: { id: HistoryOrderStatus; label: string }[] = [
  { id: "CONFIRMED", label: "Confirmado (ainda não enviado à fábrica)" },
  { id: "SENT_TO_FACTORY", label: "Enviado à fábrica" },
  { id: "INVOICED", label: "Faturado" },
  { id: "DELIVERED", label: "Entregue" },
  { id: "CANCELLED", label: "Cancelado" },
];

/** Mesma regra do servidor para juntar linhas num pedido. */
const orderKey = (r: HistoryRowInput): string =>
  r.externalRef
    ? `ref|${r.factoryId}|${r.externalRef}`
    : `day|${r.clientDocument.replace(/\D/g, "")}|${r.factoryId}|${r.sellerId}|${r.orderDate}`;

/**
 * Lotes para a mutation, sem partir um pedido ao meio — metade dos itens num
 * lote e metade no outro viraria dois pedidos, e o segundo seria recusado como
 * "já importado".
 */
export const chunkByOrder = (
  rows: HistoryRowInput[],
  maxRows = 2000
): HistoryRowInput[][] => {
  const byOrder = new Map<string, HistoryRowInput[]>();
  for (const row of rows) {
    const key = orderKey(row);
    byOrder.set(key, [...(byOrder.get(key) ?? []), row]);
  }
  const chunks: HistoryRowInput[][] = [];
  let current: HistoryRowInput[] = [];
  for (const group of byOrder.values()) {
    if (current.length > 0 && current.length + group.length > maxRows) {
      chunks.push(current);
      current = [];
    }
    current = current.concat(group);
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
};

const EMPTY: HistoryResult = {
  dryRun: true,
  totalRows: 0,
  ordersCreated: 0,
  ordersAlreadyImported: 0,
  ordersSkipped: 0,
  itemsImported: 0,
  itemsSkipped: 0,
  linksCreated: 0,
  clientsCreated: 0,
  productsCreated: 0,
  sellerAccessesGranted: 0,
  installmentsCreated: 0,
  issues: [],
  missingProducts: [],
  missingClients: [],
  missingSellerAccess: [],
  newPaymentTerms: [],
};

/** Soma os resultados dos lotes num resumo só (listas somadas por chave). */
export const mergeResults = (results: HistoryResult[]): HistoryResult => {
  const products = new Map<string, HistoryResult["missingProducts"][number]>();
  const clients = new Map<string, number>();
  const accesses = new Map<
    string,
    HistoryResult["missingSellerAccess"][number]
  >();
  // Cada parte da prévia roda sozinha: o mesmo prazo novo volta em várias.
  const terms = new Map<string, HistoryResult["newPaymentTerms"][number]>();
  const merged = results.reduce<HistoryResult>(
    (acc, r) => {
      r.missingProducts.forEach((p) => {
        const key = `${p.factoryId}|${p.code ?? ""}|${p.name ?? ""}`;
        const prev = products.get(key);
        products.set(
          key,
          prev
            ? {
                ...prev,
                rows: prev.rows + p.rows,
                amount: (Number(prev.amount) + Number(p.amount)).toFixed(2),
              }
            : p
        );
      });
      r.missingSellerAccess.forEach((a) => {
        const key = `${a.sellerId}|${a.factoryId}`;
        const prev = accesses.get(key);
        accesses.set(
          key,
          prev ? { ...prev, orders: prev.orders + a.orders } : a
        );
      });
      r.newPaymentTerms.forEach((t) =>
        terms.set(`${t.factoryId}|${t.name}`, t)
      );
      r.missingClients.forEach((c) =>
        clients.set(c.document, (clients.get(c.document) ?? 0) + c.rows)
      );
      return {
        ...acc,
        dryRun: r.dryRun,
        totalRows: acc.totalRows + r.totalRows,
        ordersCreated: acc.ordersCreated + r.ordersCreated,
        ordersAlreadyImported:
          acc.ordersAlreadyImported + r.ordersAlreadyImported,
        ordersSkipped: acc.ordersSkipped + r.ordersSkipped,
        itemsImported: acc.itemsImported + r.itemsImported,
        itemsSkipped: acc.itemsSkipped + r.itemsSkipped,
        linksCreated: acc.linksCreated + r.linksCreated,
        clientsCreated: acc.clientsCreated + r.clientsCreated,
        productsCreated: acc.productsCreated + r.productsCreated,
        sellerAccessesGranted:
          acc.sellerAccessesGranted + r.sellerAccessesGranted,
        installmentsCreated: acc.installmentsCreated + r.installmentsCreated,
        issues: acc.issues.concat(r.issues),
      };
    },
    { ...EMPTY, dryRun: results[0]?.dryRun ?? true }
  );
  return {
    ...merged,
    missingProducts: [...products.values()].sort((a, b) => b.rows - a.rows),
    missingClients: [...clients.entries()]
      .map(([document, rows]) => ({ document, rows }))
      .sort((a, b) => b.rows - a.rows),
    missingSellerAccess: [...accesses.values()].sort(
      (a, b) => b.orders - a.orders
    ),
    newPaymentTerms: [...terms.values()],
  };
};

/** Quanto os pedidos deixam de somar com os produtos fora do catálogo. */
export const missingProductsAmount = (result: HistoryResult): number =>
  result.missingProducts.reduce((sum, p) => sum + Number(p.amount), 0);
