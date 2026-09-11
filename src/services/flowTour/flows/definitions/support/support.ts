import { FlowDefinition } from "../../../interface";
import { SUPPORT_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

/**
 * Tour dos Atendimentos. Dispara sozinho na 1ª visita.
 *
 * Sem gate de papel: reclamação de cliente é operação básica, e o vendedor
 * entra para ver os casos dos clientes DELE (o recorte é no resolver, não na
 * tela). Por isso nenhum passo é gateado — os três valem para todo mundo.
 */
export const supportFlow: FlowDefinition = {
  key: SUPPORT_FLOW,
  label: "Tour dos Atendimentos",
  description: "A fila de problemas dos clientes e o andamento de cada um.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.support,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="support-actions"]',
      title: "Registrar um problema",
      description:
        "Cliente reclamou de mercadoria, de pagamento ou de entrega? Registre aqui para o caso não morrer no WhatsApp.",
      side: "bottom",
      align: "end",
    },
    {
      element: '[data-tour="support-counts"]',
      title: "Quem está com a bola",
      description:
        "Os números seguem a ordem de quem precisa agir: primeiro o que ninguém assumiu, depois o que está andando, depois o que espera a fábrica ou o cliente.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="support-table"]',
      title: "A fila",
      description:
        "Cada linha é um caso, com o cliente, a fábrica e a situação. Clique para abrir e registrar o que foi feito.",
      side: "top",
      align: "start",
    },
  ],
};
