import { FlowDefinition } from "../../../interface";
import { PRICE_LIST_DETAIL_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour de dentro de uma tabela de preço (itens por nível comercial).
export const priceListDetailFlow: FlowDefinition = {
  key: PRICE_LIST_DETAIL_FLOW,
  label: "Tour de dentro da tabela",
  description: "Lance e revise os preços por produto e nível comercial.",
  group: "Catálogo e preços",
  route: FLOW_ROUTES.priceListDetail,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="price-detail-actions"]',
      title: "Situação da tabela",
      description:
        "Aqui você vê se a tabela está ativa e acessa as ações dela. Só tabelas ativas valem para novos pedidos.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="price-items-actions"]',
      title: "Adicionar item",
      description:
        "Adicione um produto à tabela e informe o preço. Use a busca para localizar um item já lançado.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="price-items-table"]',
      title: "Preços por nível",
      description:
        'Cada linha mostra o preço de um produto por nível comercial, com a coluna "Preço c/ imposto" já calculada.',
      side: "top",
      align: "start",
    },
  ],
};
