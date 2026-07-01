import { FlowDefinition } from "../../../interface";
import { SETTINGS_CATALOG_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour das Configurações (catálogos da empresa). A rota /settings redireciona para
// /settings/catalog, então o fluxo é ancorado nesta última.
export const settingsCatalogFlow: FlowDefinition = {
  key: SETTINGS_CATALOG_FLOW,
  label: "Tour das Configurações",
  description: "Catálogos da empresa e configuração de rotina.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.settingsCatalog,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="settings-tabs"]',
      title: "Catálogos e rotina",
      description:
        'Em "Catálogos da empresa" você define listas reutilizáveis. Em "Configuração de rotina" você ajusta como as visitas são planejadas.',
      side: "bottom",
      align: "start",
    },
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
