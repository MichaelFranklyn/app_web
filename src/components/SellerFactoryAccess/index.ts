/**
 * Vínculo vendedor × fábrica: o acordo de comissão, a suspensão e a exclusão.
 *
 * Mora em `components` porque duas telas de grupos diferentes o usam — a aba de
 * vendedores da fábrica (`(operations)/factories/[id]/sellers`) e a seção de
 * fábricas do perfil da pessoa (`(config)/settings/users/[id]`). São as duas
 * pontas do mesmo registro: quem abre a fábrica quer mexer no vínculo dela com
 * um vendedor, e quem abre a pessoa quer mexer no vínculo dela com uma fábrica.
 */
export { AccessRowActions } from "./AccessRowActions";
export { CommissionAgreementModal } from "./CommissionAgreementModal";
export { DeleteAccessModal } from "./DeleteAccessModal";
export { UpdateAccessModal } from "./UpdateAccessModal";
export type {
  AccessFactoryRate,
  AccessFactoryRateResponse,
  SellerAccessAgreement,
} from "./interface";
export {
  SELLER_BASIS_OPTIONS,
  sellerAgreementLabel,
  sellerBasisLabel,
  sellerRateLabel,
} from "./utils";
