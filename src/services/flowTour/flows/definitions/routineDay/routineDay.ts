import { FlowDefinition } from "../../../interface";
import { ROUTINE_DAY_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour do detalhe de um dia da rotina. Dispara sozinho na 1ª vez que se abre um dia.
export const routineDayFlow: FlowDefinition = {
  key: ROUTINE_DAY_FLOW,
  label: "Tour do dia da rotina",
  description: "As visitas planejadas para um dia.",
  group: "Páginas de detalhe",
  route: FLOW_ROUTES.routineDay,
  version: 1,
  autoStart: true,
  steps: [
    {
      element: '[data-tour="routine-day-summary"]',
      title: "Resumo do dia",
      description:
        "Um panorama do dia: quantas visitas, a distância estimada da rota e o andamento.",
      side: "bottom",
      align: "start",
    },
    {
      element: '[data-tour="routine-day-stops"]',
      title: "Visitas do dia",
      description:
        "A lista de paradas na ordem da rota. Registre o que aconteceu em cada visita por aqui.",
      side: "left",
      align: "start",
    },
  ],
};
