import { FlowDefinition } from "../../../interface";
import { SETTINGS_ROUTINE_FLOW } from "../../keys";
import { FLOW_ROUTES } from "../../routes";

// Tour da Configuração de rotina (sub-aba de Configurações). Sem autoStart: o tour de
// Configurações já apresenta as abas; este fica sob demanda no botão de ajuda.
export const settingsRoutineFlow: FlowDefinition = {
  key: SETTINGS_ROUTINE_FLOW,
  label: "Configuração de rotina",
  description: "Defina como as rotinas de visita são geradas.",
  group: "Primeiros passos",
  route: FLOW_ROUTES.settingsRoutine,
  version: 1,
  steps: [
    {
      element: '[data-tour="routine-params"]',
      requireSelector: '[data-tour="routine-params"]',
      title: "Parâmetros de trabalho",
      description:
        "Defina os dias e horários de trabalho e as preferências de agendamento usados para montar a rotina automática.",
      side: "top",
      align: "start",
    },
    {
      element: '[data-tour="routine-score-weights"]',
      requireSelector: '[data-tour="routine-score-weights"]',
      title: "Pesos do score",
      description:
        "Ajuste o peso de cada fator que prioriza quais clientes visitar primeiro. As mudanças valem para as próximas rotinas geradas.",
      side: "top",
      align: "start",
    },
  ],
};
