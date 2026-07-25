// Configuração de rotina de visitas. Mora junto do card "Rotina de visitas" do
// perfil, que é quem grava — a tela /settings/routine, que calibrava os pesos do
// score, foi removida.
export {
  CREATE_SCHEDULE_CONFIG_MUTATION,
  UPDATE_SCHEDULE_CONFIG_MUTATION,
} from "./gql";
export type {
  CreateScheduleConfigInput,
  CreateScheduleConfigResponse,
  PriorityWeights,
  RoutineOperationalForm,
  ScheduleConfig,
  ScheduleConfigSeller,
  SettingsFormState,
  UpdateScheduleConfigInput,
  UpdateScheduleConfigResponse,
} from "./interface";
export {
  buildCreateInput,
  buildCreateInputFromOperational,
  DEFAULT_CONFIG_FORM,
  fromTimeInputValue,
  toggleWorkDay,
  toTimeInputValue,
  WEEKDAYS,
} from "./utils";
