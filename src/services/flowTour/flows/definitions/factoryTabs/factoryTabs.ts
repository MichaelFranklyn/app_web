import { FlowDefinition } from "../../../interface";
import {
  FACTORY_CLIENTS_FLOW,
  FACTORY_IMPORT_TEMPLATE_FLOW,
  FACTORY_ORDERS_FLOW,
  FACTORY_SELLERS_FLOW,
  FACTORY_TIERS_FLOW,
} from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tours das abas internas da fábrica. Sem autoStart: curtos e disponíveis sob demanda
// no botão de ajuda — evita disparar um tour a cada troca de aba.

export const factorySellersFlow: FlowDefinition = {
  key: FACTORY_SELLERS_FLOW,
  label: "Vendedores da fábrica",
  description: "Quem pode vender esta fábrica.",
  group: "Catálogo e preços",
  route: FLOW_ROUTES.factorySellers,
  version: 1,
  steps: [
    {
      element: '[data-tour="factory-sellers-actions"]',
      title: "Liberar acesso",
      description:
        "Dê a um vendedor acesso a esta fábrica para que ele possa atender clientes e registrar pedidos dela.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="factory-sellers-table"]',
      title: "Acessos atuais",
      description: "A lista de vendedores que hoje podem atuar nesta fábrica.",
      side: "top",
      align: "start",
    },
  ],
};

export const factoryClientsFlow: FlowDefinition = {
  key: FACTORY_CLIENTS_FLOW,
  label: "Clientes da fábrica",
  description: "Clientes vinculados a esta fábrica.",
  group: "Catálogo e preços",
  route: FLOW_ROUTES.factoryClients,
  // v2: passo do "Nível em massa".
  version: 2,
  steps: [
    {
      element: '[data-tour="factory-clients-actions"]',
      title: "Vincular cliente",
      description:
        "Vincule um cliente da sua carteira a esta fábrica e defina o nível de preço dele.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="factory-clients-bulk-tier"]',
      title: "Nível em massa",
      description:
        "Mude o nível de muitos clientes de uma vez: todos de uma cidade, de um segmento ou de uma rede. Antes de salvar, a tela mostra quantos clientes vão mudar.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="factory-clients-table"]',
      title: "Clientes vinculados",
      description:
        "Os clientes que compram desta fábrica e o nível de cada um.",
      side: "top",
      align: "start",
    },
  ],
};

// Mora na mesma página das tabelas (/price-lists), ao lado do tour delas, que é o
// que abre sozinho; este fica no botão de ajuda.
export const factoryTiersFlow: FlowDefinition = {
  key: FACTORY_TIERS_FLOW,
  label: "Níveis de preço",
  description: "Preço por tipo de cliente, inclusive o nível calculado em %.",
  group: "Catálogo e preços",
  route: FLOW_ROUTES.factoryPrices,
  version: 1,
  steps: [
    {
      element: '[data-tour="factory-tiers-table"]',
      title: "O que é um nível",
      description:
        "Nível é um tipo de cliente que paga um preço diferente — por exemplo, Capital e Interior. Cada tabela de preços tem um preço para cada nível.",
      side: "top",
      align: "start",
    },
    {
      element: '[data-tour="factory-tiers-actions"]',
      title: "Nível calculado em %",
      description:
        "Em Novo nível, escolha “Percentual sobre outro nível” — ex.: Interior = Capital +8%. Não precisa de planilha: o preço é refeito sozinho sempre que o outro nível mudar.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="factory-tiers-table"]',
      title: "Quem paga cada nível",
      description:
        "O nível de cada cliente se escolhe na aba Clientes — um a um ou com “Nível em massa”. Ele decide o preço do pedido e, se você ligar um prazo de pagamento ao nível, o prazo sugerido.",
      side: "top",
      align: "start",
    },
  ],
};

export const factoryOrdersFlow: FlowDefinition = {
  key: FACTORY_ORDERS_FLOW,
  label: "Pedidos da fábrica",
  description: "Os pedidos feitos para esta fábrica.",
  group: "Catálogo e preços",
  route: FLOW_ROUTES.factoryOrders,
  version: 1,
  steps: [
    {
      element: '[data-tour="factory-orders-actions"]',
      title: "Novo pedido",
      description: "Registre um pedido já com esta fábrica pré-selecionada.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="factory-orders-table"]',
      title: "Pedidos desta fábrica",
      description:
        "Todos os pedidos ligados a esta fábrica. Clique numa linha para abrir o pedido.",
      side: "top",
      align: "start",
    },
  ],
};

export const factoryImportTemplateFlow: FlowDefinition = {
  key: FACTORY_IMPORT_TEMPLATE_FLOW,
  label: "Modelo de importação",
  description: "Como o sistema lê os pedidos desta fábrica.",
  group: "Catálogo e preços",
  route: FLOW_ROUTES.factoryImportTemplate,
  version: 1,
  steps: [
    {
      element: '[data-tour="factory-import-template"]',
      title: "Modelo de importação de pedidos",
      description:
        "Aqui você ensina o sistema a ler os pedidos no formato desta fábrica (PDF/planilha), para a importação preencher os itens sozinha.",
      side: "top",
      align: "start",
    },
  ],
};
