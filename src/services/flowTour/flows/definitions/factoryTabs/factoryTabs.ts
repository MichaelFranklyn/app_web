import { FlowDefinition } from "../../../interface";
import {
  FACTORY_CLIENTS_FLOW,
  FACTORY_IMPORT_TEMPLATE_FLOW,
  FACTORY_ORDERS_FLOW,
  FACTORY_SELLERS_FLOW,
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
  version: 1,
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
      element: '[data-tour="factory-clients-table"]',
      title: "Clientes vinculados",
      description:
        "Os clientes que compram desta fábrica e o nível de cada um.",
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
