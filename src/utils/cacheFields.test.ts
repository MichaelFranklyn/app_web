import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CLIENT_FACTORY_LINK_CACHE_FIELDS,
  CLIENT_NETWORK_CACHE_FIELDS,
  CLIENT_STOCK_CACHE_FIELDS,
  COMMISSION_CACHE_FIELDS,
  FACTORY_CACHE_FIELDS,
  ORDER_CACHE_FIELDS,
  PRICE_ITEM_CACHE_FIELDS,
  PRICE_LIST_CACHE_FIELDS,
  PRICE_TIER_CACHE_FIELDS,
  PRODUCT_CACHE_FIELDS,
  SUPPORT_CACHE_FIELDS,
  USER_CACHE_FIELDS,
  VISIT_CACHE_FIELDS,
} from "./cacheFields";

/**
 * Quem mexe num assunto invalida a lista INTEIRA de campos afetados.
 *
 * O bug que este teste trava: cada ponto de escrita escolhia o que lembrava.
 * Criar pedido pela lista invalidava `orders` + `orderStats`; pela ficha da
 * fábrica, só `orders`; pela visita, `orders` + `companyClient`; pela ficha do
 * cliente, nada — e ali o resumo por fábrica só mudava depois de um F5. Como a
 * tela de origem fica no cache enquanto a nova abre, o que falta na lista é
 * exatamente o que o usuário vê velho.
 *
 * São duas cobranças, e é a segunda que pega o caso mais comum:
 * 1. quem invalida tem de usar a constante do assunto (nada de array literal);
 * 2. quem escreve tem de invalidar — ou delegar, nomeando quem faz por ele.
 */
const ROOT = resolve(process.cwd(), "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!/\.tsx?$/.test(entry.name)) return [];
    if (/\.(test|spec)\.tsx?$/.test(entry.name)) return [];
    return [path];
  });
}

const files = sourceFiles(ROOT).map((path) => ({
  path: path.slice(ROOT.length + 1),
  code: readFileSync(path, "utf8"),
}));

interface Assunto {
  /** Como o assunto aparece no nome do teste. */
  nome: string;
  /** Nome da constante, como escrito no código dos pontos de escrita. */
  constante: string;
  /** Campos do schema que o assunto desatualiza. */
  campos: string[];
  /**
   * Mutations que mudam o que as OUTRAS telas mostram. Ficam de fora as que só
   * mexem no que já está na tela — `updateOrder` genérico do `EditOrderModal`,
   * por exemplo, edita a observação e nada mais.
   */
  mutations: string[];
  /**
   * Quem dispara sem invalidar porque outro faz por ele: o caminho do escritor
   * aponta o DONO que invalida. O dono é conferido junto (tem de existir e tem
   * de citar a constante) — senão bastaria alguém apagar o invalidate do dono
   * para o assunto inteiro ficar descoberto sem nenhum teste reclamar.
   */
  delegacoes: Record<string, string>;
}

const ASSUNTOS: Assunto[] = [
  {
    nome: "pedido",
    constante: "ORDER_CACHE_FIELDS",
    campos: ORDER_CACHE_FIELDS,
    mutations: [
      "createOrder",
      "deleteOrder",
      "createOrderItem",
      "updateOrderItem",
      "deleteOrderItem",
      "invoiceOrder",
      "uninvoiceOrder",
      "reviseOrderInvoice",
      "markOrderDelivered",
      "markOrderSent",
      "confirmOrderImport",
      "ConvertQuoteToOrder",
    ],
    delegacoes: {
      // helper puro e wizard: quem CRIA o pedido invalida depois de gravar.
      "app/(inside)/(operations)/_shared/orderDraftItems/createDraftItems.ts":
        "app/(inside)/(operations)/orders/_components/OrdersHeader/AddOrderModal/useAddOrder.ts",
      "app/(inside)/(operations)/_components/OrderImportWizard/useOrderImportWizard.ts":
        "app/(inside)/(operations)/orders/_components/OrdersHeader/ImportOrderModal/useImportOrder.ts",
      // itens do pedido: o handleRefetch da tabela invalida.
      "app/(inside)/(operations)/orders/[id]/_components/OrderItemsTable/AddOrderItemModal/useAddOrderItem.ts":
        "app/(inside)/(operations)/orders/[id]/_components/OrderItemsTable/index.tsx",
      "app/(inside)/(operations)/orders/[id]/_components/OrderItemsTable/EditOrderItemModal/index.tsx":
        "app/(inside)/(operations)/orders/[id]/_components/OrderItemsTable/index.tsx",
      "app/(inside)/(operations)/orders/[id]/_components/OrderItemsTable/DeleteOrderItemModal/index.tsx":
        "app/(inside)/(operations)/orders/[id]/_components/OrderItemsTable/index.tsx",
    },
  },
  {
    nome: "comissão",
    constante: "COMMISSION_CACHE_FIELDS",
    campos: COMMISSION_CACHE_FIELDS,
    mutations: [
      "payOrderInstallments",
      "cancelOrderInstallment",
      "revertOrderInstallment",
      "markOrderInstallmentsDefaulted",
      "markCommissionReceived",
      "unmarkCommissionReceived",
      "setCommissionReconciled",
      "markSellerCommissionPaid",
      "unmarkSellerCommissionPaid",
      "scheduleSellerChargeback",
      "settleInstallmentsInPeriod",
      "markChargebackSettled",
      "markSellerChargebackSettled",
      "markChargebackRefunded",
      "markSellerChargebackRefunded",
    ],
    delegacoes: {
      // Toda escrita da tela passa pelo handleChanged do content.
      "app/(inside)/(operations)/commissions/_components/CommissionsTable/CommissionRowActions.tsx":
        "app/(inside)/(operations)/commissions/content.tsx",
      "app/(inside)/(operations)/commissions/_components/BulkActionsBar/index.tsx":
        "app/(inside)/(operations)/commissions/content.tsx",
      "app/(inside)/(operations)/commissions/_components/MarkReceivedModal/index.tsx":
        "app/(inside)/(operations)/commissions/content.tsx",
      "app/(inside)/(operations)/commissions/_components/ReconcileToggle/index.tsx":
        "app/(inside)/(operations)/commissions/content.tsx",
      "app/(inside)/(operations)/commissions/_components/SettlePeriodModal/index.tsx":
        "app/(inside)/(operations)/commissions/content.tsx",
      "app/(inside)/(operations)/commissions/_components/SellerChargebackPanel/useChargebackActions.ts":
        "app/(inside)/(operations)/commissions/content.tsx",
    },
  },
  {
    nome: "visita",
    constante: "VISIT_CACHE_FIELDS",
    campos: VISIT_CACHE_FIELDS,
    mutations: [
      "createVisitScheduleItem",
      "updateVisitScheduleItem",
      "scheduleManualVisit",
      "markVisitWholeDay",
      "promoteContactToVisit",
      "rescheduleVisit",
    ],
    delegacoes: {
      // Os modais da rotina recebem o syncVisit de useVisitActions como onDone.
      "app/(inside)/(operations)/routines/_components/VisitActions/EditVisitModal/index.tsx":
        "app/(inside)/(operations)/routines/useVisitActions.tsx",
      "app/(inside)/(operations)/routines/_components/VisitActions/RescheduleVisitModal/index.tsx":
        "app/(inside)/(operations)/routines/useVisitActions.tsx",
      "app/(inside)/(operations)/routines/_components/VisitActions/WholeDayModal/index.tsx":
        "app/(inside)/(operations)/routines/useVisitActions.tsx",
      "app/(inside)/(operations)/routines/_components/PromoteContactModal/usePromoteContact.ts":
        "app/(inside)/(operations)/routines/useVisitActions.tsx",
    },
  },
  {
    nome: "estoque do cliente",
    constante: "CLIENT_STOCK_CACHE_FIELDS",
    campos: CLIENT_STOCK_CACHE_FIELDS,
    mutations: ["updateProductStock", "saveVisitStockObservations"],
    delegacoes: {},
  },
  {
    nome: "preço lançado",
    constante: "PRICE_ITEM_CACHE_FIELDS",
    campos: PRICE_ITEM_CACHE_FIELDS,
    mutations: [
      "createPriceListItem",
      "updatePriceListItem",
      "deletePriceListItem",
      "setPriceListPromotion",
      "clearPriceListPromotion",
      "importFactoryPriceList",
    ],
    delegacoes: {},
  },
  {
    nome: "produto",
    constante: "PRODUCT_CACHE_FIELDS",
    campos: PRODUCT_CACHE_FIELDS,
    // `createProduct` fica de fora: a lista recebe a linha por otimista e a
    // ficha do produto novo ainda não existe em cache nenhum.
    mutations: ["updateProduct", "deleteProduct"],
    delegacoes: {},
  },
  {
    nome: "tabela de preço",
    constante: "PRICE_LIST_CACHE_FIELDS",
    campos: PRICE_LIST_CACHE_FIELDS,
    mutations: [
      "createFactoryPriceList",
      "cloneFactoryPriceList",
      "updateFactoryPriceList",
      "deleteFactoryPriceList",
    ],
    delegacoes: {},
  },
  {
    nome: "nível comercial",
    constante: "PRICE_TIER_CACHE_FIELDS",
    campos: PRICE_TIER_CACHE_FIELDS,
    mutations: ["createPriceTier", "updatePriceTier", "deletePriceTier"],
    delegacoes: {},
  },
  {
    nome: "atendimento",
    constante: "SUPPORT_CACHE_FIELDS",
    campos: SUPPORT_CACHE_FIELDS,
    mutations: [
      "createClientSupportCase",
      "updateClientSupportCase",
      "addClientSupportUpdate",
      "deleteClientSupportCase",
    ],
    delegacoes: {},
  },
  {
    nome: "pessoa",
    constante: "USER_CACHE_FIELDS",
    campos: USER_CACHE_FIELDS,
    mutations: ["createUser", "updateUser", "toggleUser", "deleteUser"],
    delegacoes: {},
  },
  {
    nome: "rede de clientes",
    constante: "CLIENT_NETWORK_CACHE_FIELDS",
    campos: CLIENT_NETWORK_CACHE_FIELDS,
    mutations: [
      "createClientNetwork",
      "updateClientNetwork",
      "deleteClientNetwork",
    ],
    delegacoes: {},
  },
  {
    nome: "vínculo com a fábrica",
    constante: "FACTORY_CACHE_FIELDS",
    campos: FACTORY_CACHE_FIELDS,
    // Só a exclusão: ela cascateia sete tipos de dado no backend. Criar e
    // editar mexem na própria lista, que já se atualiza sozinha.
    mutations: ["deleteCompanyFactory"],
    delegacoes: {},
  },
  {
    nome: "vínculo cliente-fábrica",
    constante: "CLIENT_FACTORY_LINK_CACHE_FIELDS",
    campos: CLIENT_FACTORY_LINK_CACHE_FIELDS,
    mutations: [
      "createSellerClientFactory",
      "updateSellerClientFactory",
      "deleteSellerClientFactory",
    ],
    delegacoes: {},
  },
];

/** Dispara a mutation na mão (o documento gql sozinho não muda nada). */
function escritores({ mutations }: Assunto) {
  return files.filter(
    ({ code }) =>
      code.includes("useMutation") &&
      mutations.some((name) => new RegExp(`\\b${name}\\b`).test(code))
  );
}

describe.each(ASSUNTOS)("campos de cache de $nome", (assunto) => {
  const writers = escritores(assunto);

  it("achou os pontos que escrevem", () => {
    expect(writers.length).toBeGreaterThan(0);
  });

  it("todo ponto invalida (ou delega a quem invalida)", () => {
    const omissos = writers
      .filter(({ path, code }) => {
        if (path in assunto.delegacoes) return false;
        return !code.includes(assunto.constante);
      })
      .map(({ path }) => path);
    expect(omissos).toEqual([]);
  });

  it("nenhum ponto monta a própria lista de campos", () => {
    const artesanais = writers
      .filter(({ path, code }) => {
        if (path in assunto.delegacoes) return false;
        // Chamada com array literal em vez da constante compartilhada.
        return /invalidateClient\(\s*\[\s*["']/.test(code);
      })
      .map(({ path }) => path);
    expect(artesanais).toEqual([]);
  });

  it("a lista de delegações não guarda arquivo que sumiu ou parou de escrever", () => {
    const vivos = new Set(writers.map(({ path }) => path));
    const orfaos = Object.keys(assunto.delegacoes).filter(
      (path) => !vivos.has(path)
    );
    expect(orfaos).toEqual([]);
  });

  it("o dono de cada delegação existe e invalida de verdade", () => {
    const donosQuebrados = Object.entries(assunto.delegacoes)
      .filter(([, dono]) => {
        const arquivo = files.find(({ path }) => path === dono);
        return !arquivo || !arquivo.code.includes(assunto.constante);
      })
      .map(([escritor, dono]) => `${escritor} → ${dono}`);
    expect(donosQuebrados).toEqual([]);
  });
});

describe("as listas por assunto", () => {
  it("cobrem, no pedido, a lista, a ficha do cliente e a lista de clientes", () => {
    expect(ORDER_CACHE_FIELDS).toEqual([
      "orders",
      "orderStats",
      "companyClient",
      "clients",
      "clientStats",
      "clientProductAnalysis",
    ]);
  });

  it("cobrem, na comissão, a tela/relatório e o pedido onde a parcela vive", () => {
    expect(COMMISSION_CACHE_FIELDS).toEqual(["commissions", "order"]);
  });

  it("cobrem, na visita, a ficha do cliente e a rotina da semana", () => {
    expect(VISIT_CACHE_FIELDS).toEqual([
      "visitsByCompanyClient",
      "visitSchedules",
    ]);
  });

  it("cobrem, no vínculo, a lista que as duas pontas leem e o score que ele alimenta", () => {
    expect(CLIENT_FACTORY_LINK_CACHE_FIELDS).toEqual([
      "sellerClientFactoryList",
      "companyClient",
      "clientVisitScores",
    ]);
  });

  it("cobrem, no preço, o item que as duas telas leem", () => {
    expect(PRICE_ITEM_CACHE_FIELDS).toEqual(["priceListItems"]);
  });

  it("cobrem, no produto, a lista, a ficha e o que a exclusão leva junto", () => {
    expect(PRODUCT_CACHE_FIELDS).toEqual([
      "products",
      "product",
      "priceListItems",
      "productTaxes",
    ]);
  });

  it("cobrem, na tabela de preço, a aba e os preços dela", () => {
    expect(PRICE_LIST_CACHE_FIELDS).toEqual([
      "factoryPriceLists",
      "factoryPriceList",
      "priceListItems",
    ]);
  });

  it("cobrem, no nível, o catálogo que quatro telas escolhem", () => {
    expect(PRICE_TIER_CACHE_FIELDS).toEqual(["priceTiers"]);
  });

  it("cobrem, no atendimento, a fila e os cartões de contagem", () => {
    expect(SUPPORT_CACHE_FIELDS).toEqual([
      "clientSupportCases",
      "clientSupportCounts",
    ]);
  });

  it("cobrem, na pessoa, a lista, a ficha e o cadastro de vendedor", () => {
    expect(USER_CACHE_FIELDS).toEqual(["users", "user", "sellers"]);
  });

  it("cobrem, na rede, a lista e a ficha", () => {
    expect(CLIENT_NETWORK_CACHE_FIELDS).toEqual([
      "clientNetworks",
      "clientNetwork",
    ]);
  });

  it("cobrem, na fábrica, tudo o que a exclusão cascateia", () => {
    expect(FACTORY_CACHE_FIELDS).toEqual([
      "companyFactories",
      "sellerFactoryAccessList",
      "sellerClientFactoryList",
      "products",
      "factoryPriceLists",
      "priceListItems",
      "priceTiers",
      "importTemplates",
    ]);
  });

  it("cobrem, no estoque, a aba, a ficha, o histórico de score e a lista", () => {
    expect(CLIENT_STOCK_CACHE_FIELDS).toEqual([
      "clientProductInsights",
      "companyClient",
      "clientVisitScores",
      "clients",
      "clientProductAnalysis",
    ]);
  });
});
