import { FlowDefinition } from "../../../interface";
import { PRODUCT_DETAIL_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da página de um produto. Dispara sozinho na 1ª vez que se abre qualquer produto.
export const productDetailFlow: FlowDefinition = {
  key: PRODUCT_DETAIL_FLOW,
  label: "Tour da página do produto",
  description: "Preços, dados, impostos e componentes de um produto.",
  group: "Catálogo e preços",
  route: FLOW_ROUTES.productDetail,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="product-prices"]',
      title: "Preços do produto",
      description:
        "O preço deste produto em cada tabela e nível comercial. O preço é sempre o da embalagem fechada; o por unidade é derivado.",
      side: "right",
      align: "start",
    },
    {
      element: '[data-tour="product-info"]',
      title: "Dados do produto",
      description:
        "SKU, unidade, embalagem e unidades por embalagem. Edite por aqui quando algo mudar.",
      side: "left",
      align: "start",
    },
    {
      element: '[data-tour="product-taxes"]',
      title: "Impostos",
      description:
        "Os impostos aplicados a este produto, que compõem o preço final com imposto.",
      side: "left",
      align: "start",
    },
    {
      element: '[data-tour="product-components"]',
      title: "Componentes (kits)",
      description:
        "Se o produto for um kit, aqui ficam os itens que o compõem.",
      side: "left",
      align: "start",
    },
  ],
};
