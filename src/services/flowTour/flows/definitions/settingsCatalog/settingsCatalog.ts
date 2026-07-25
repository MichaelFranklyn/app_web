import { FlowDefinition } from "../../../interface";
import { SETTINGS_CATALOG_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour dos catálogos da empresa. A apresentação das Configurações como um todo
// vive no fluxo do índice (settingsHub, na rota /settings); aqui o foco são as
// listas em si. Version 2: o passo das abas saiu quando /settings virou hub.
export const settingsCatalogFlow: FlowDefinition = {
  key: SETTINGS_CATALOG_FLOW,
  label: "Tour dos catálogos",
  description: "As listas que padronizam o cadastro de produtos.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.settingsCatalog,
  version: 2,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="settings-catalog-sections"]',
      title: "Catálogos reutilizáveis",
      description:
        "Aqui ficam categorias de produto, unidades, rótulos de embalagem e regras de imposto — usados em todo o sistema para padronizar o cadastro.",
      side: "top",
      align: "start",
    },
  ],
};
