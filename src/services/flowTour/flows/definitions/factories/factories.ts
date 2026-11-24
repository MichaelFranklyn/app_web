import { FlowDefinition } from "../../../interface";
import { FACTORIES_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da listagem de Fábricas. Dispara sozinho na 1ª visita.
export const factoriesFlow: FlowDefinition = {
  key: FACTORIES_FLOW,
  label: "Tour das Fábricas",
  description: "Veja como vincular fábricas e acessar seus catálogos.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.factories,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="factories-actions"]',
      title: "Buscar, importar e vincular",
      description:
        'Busque uma fábrica pelo nome ou CNPJ, importe várias de uma planilha ou use "Vincular Fábrica" para adicionar uma.',
      // Vendedor não importa nem vincula (`FactoriesHeader`): para ele o passo
      // fala só da busca — o texto do gestor apontava botões que ele não tem.
      roleText: [
        {
          roles: ["SELLER"],
          title: "Buscar uma fábrica",
          description: "Busque uma fábrica pelo nome ou pelo CNPJ.",
        },
      ],
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="factories-grid"]',
      requireSelector: '[data-tour="factories-card"]',
      title: "Suas fábricas",
      description:
        "Cada cartão é uma fábrica que você representa, com a comissão, a base de cálculo e a situação do contrato.",
      roleText: [
        {
          roles: ["SELLER"],
          description:
            "Cada cartão é uma fábrica que você pode vender, com a sua comissão, quando você recebe e a situação do contrato.",
        },
      ],
      side: "top",
      align: "start",
    },
    {
      element: '[data-tour="factories-card"]',
      requireSelector: '[data-tour="factories-card"]',
      // "Ver detalhes" só existe para a gestão (o detalhe é bloqueado ao vendedor).
      roles: ["OWNER", "ADMIN", "SU"],
      title: "Abrir uma fábrica",
      description:
        'Clique em "Ver detalhes" para acessar o catálogo, as tabelas de preço e os impostos da fábrica.',
      side: "right",
      align: "start",
    },
  ],
};
