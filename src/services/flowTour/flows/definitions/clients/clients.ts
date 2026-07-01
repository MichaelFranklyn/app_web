import { FlowDefinition } from "../../../interface";
import { CLIENTS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da listagem de Clientes. Dispara sozinho na 1ª visita.
export const clientsFlow: FlowDefinition = {
  key: CLIENTS_FLOW,
  label: "Tour dos Clientes",
  description: "Conheça a carteira de clientes e como abrir um cliente.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.clients,
  version: 1,
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
      element: '[data-tour="clients-search"]',
      title: "Buscar cliente",
      description: "Digite o nome de uma empresa para encontrá-la rapidamente.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="clients-table"]',
      requireSelector: '[data-tour="clients-row"]',
      title: "Sua carteira",
      description:
        "Esta é a lista dos seus clientes, com CNPJ, cidade, vendedor e score de cada um.",
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
