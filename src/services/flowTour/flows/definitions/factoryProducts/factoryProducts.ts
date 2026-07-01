import { FlowDefinition } from "../../../interface";
import { FACTORY_PRODUCTS_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour do catálogo de produtos de uma fábrica.
export const factoryProductsFlow: FlowDefinition = {
  key: FACTORY_PRODUCTS_FLOW,
  label: "Tour do catálogo de produtos",
  description: "Como cadastrar, importar e revisar os produtos da fábrica.",
  group: "Catálogo e preços",
  route: FLOW_ROUTES.factoryProducts,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="products-actions"]',
      title: "Adicionar e importar produtos",
      description:
        "Cadastre um produto na mão ou importe vários de uma planilha. Use a busca para achar um produto pelo nome ou SKU.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="products-attention"]',
      title: "Produtos que precisam de atenção",
      description:
        "Quando uma importação fica em dúvida (produto novo, sem preço ou com nível assumido), ele é marcado. Clique aqui para ver só esses e revisá-los.",
      side: "bottom",
      align: "center",
    },
    {
      element: '[data-tour="products-table"]',
      requireSelector: '[data-tour="products-row"]',
      title: "Catálogo",
      description:
        "Cada linha é um produto, com SKU, unidade e embalagem. A etiqueta âmbar avisa quando algo precisa de revisão.",
      side: "top",
      align: "start",
    },
    {
      element: '[data-tour="products-row"]',
      requireSelector: '[data-tour="products-row"]',
      title: "Abrir um produto",
      description:
        "Clique em uma linha para editar os dados do produto e os componentes (no caso de kits).",
      side: "top",
      align: "start",
    },
  ],
};
