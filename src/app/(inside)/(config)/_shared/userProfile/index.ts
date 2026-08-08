// Perfil de pessoa, compartilhado entre as duas telas que o montam: o gestor
// abrindo alguém em /settings/users/[id] e a própria pessoa em /settings/user/[id]. Os
// cards são os mesmos nas duas — o que muda é quem pode editar o quê, e isso
// entra por `onEdit` (card sem `onEdit` é só leitura).
//
// Tudo numa página só: cada bloco é um card com o seu próprio cabeçalho, um
// embaixo do outro. Não há abas — quem abre o perfil vê a pessoa inteira sem
// precisar descobrir onde clicar.
export { USER_DETAIL_QUERY } from "./gql";
export type {
  ProfileScheduleConfig,
  ProfileSeller,
  UserDetail,
  UserDetailQueryResponse,
} from "./interface";
export { ROLE_COLOR, ROLE_LABEL } from "./roles";
export type { UserRole } from "./roles";
export { formatAddressLine, formatTime, formatWorkDays } from "./utils";
export {
  buildPersonFormSteps,
  buildPersonInitialData,
  normalizePersonData,
} from "./personDataForm";
export type { PersonDataInput } from "./personDataForm/types";

export { ClientsSection } from "./ClientsSection";
export { EditSellerDataModal } from "./EditSellerDataModal";
export { EnableSellerCard } from "./EnableSellerCard";
export { EnableSellerModal } from "./EnableSellerModal";
export { FactoriesSection } from "./FactoriesSection";
export { FixedSchedulesSection } from "./FixedSchedulesSection";
// Reexportado para quem monta os cards do perfil não precisar saber de dois
// caminhos — a fonte é `_shared/dataCards`.
export { DataField, EditCardAction } from "../dataCards";
export { PersonalDataCard } from "./PersonalDataCard";
export { PersonDataModal } from "./PersonDataModal";
export { RoutineSection } from "./RoutineSection";
export { SellerDataCard } from "./SellerDataCard";
export { SellerKpis } from "./SellerKpis";
export { SystemAccessCard } from "./SystemAccessCard";
export { UserProfileHeader } from "./UserProfileHeader";
export { UserProfileSkeleton } from "./UserProfileSkeleton";
