import { FlowDefinition } from "../../../interface";
import { SELLERS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da página de Vendedores. Dispara sozinho na 1ª visita.
export const sellersFlow: FlowDefinition = {
  key: SELLERS_FLOW,
  label: "Tour dos Vendedores",
  description: "Entenda a lista de vendedores e os acessos por fábrica.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.sellers,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="sellers-tabs"]',
      title: "Vendedores e acessos",
      description:
        'Em "Lista de Vendedores" você gerencia os perfis em campo. Em "Acessos por Fábrica" você define quais fábricas cada vendedor pode atender.',
      side: "bottom",
      align: "start",
    },
  ],
};
