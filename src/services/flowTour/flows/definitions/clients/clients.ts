import { FlowDefinition } from "../../../interface";
import { CLIENTS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour da listagem de Clientes. Dispara sozinho na 1ª visita.
 *
 * Version 2: o passo da carteira descrevia quatro colunas e a tabela tem seis.
 * Faltavam justamente as duas de comportamento — última compra e última visita
 * —, que são as que fazem a lista valer como leitura de carteira e as únicas
 * pelas quais se ordena para achar cliente parado.
 */
export const clientsFlow: FlowDefinition = {
  key: CLIENTS_FLOW,
  label: "Tour dos Clientes",
  description: "Conheça a carteira de clientes e como abrir um cliente.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.clients,
  version: 2,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="clients-actions"]',
      title: "Adicionar e exportar",
      description:
        "Aqui você cadastra um novo cliente ou exporta a sua carteira para uma planilha.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="clients-filters"]',
      title: "Buscar e filtrar",
      description:
        "Clique aqui para procurar uma empresa pelo nome, ou para ver só os clientes de um vendedor, de um estado, ou só os cadastros que precisam de atenção.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="clients-table"]',
      requireSelector: '[data-tour="clients-row"]',
      title: "Sua carteira",
      description:
        "Esta é a lista dos seus clientes: nome e CNPJ, cidade, vendedor, a última compra, a última visita e o score de cada um. Clique no título de uma coluna para ordenar por ela — é assim que se acha quem está parado há mais tempo.",
      side: "top",
      align: "start",
    },
    {
      element: '[data-tour="clients-row"]',
      requireSelector: '[data-tour="clients-row"]',
      title: "Abrir um cliente",
      description:
        "Clique em uma linha para abrir a página completa do cliente e ver todos os detalhes.",
      side: "top",
      align: "start",
    },
  ],
};
