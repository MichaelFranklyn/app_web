/**
 * Tipos do vínculo vendedor × fábrica — o que se edita nele a partir de
 * qualquer tela que o mostre (a fábrica lista os vendedores dela, o perfil da
 * pessoa lista as fábricas dela).
 */

/** Taxa de comissão de uma fábrica vinculada (alimenta a prévia do acordo). */
export interface AccessFactoryRate {
  id: string;
  factoryId: string;
  commissionRate: number;
}

export interface AccessFactoryRateResponse {
  access_factory_rate: { edges: { node: AccessFactoryRate }[] };
}

/** O acordo de comissão de um vínculo, como as tabelas o carregam. */
export interface SellerAccessAgreement {
  /** Percentual do PEDIDO que fica com o vendedor; nulo = a comissão inteira. */
  sellerCommissionRate: string | number | null;
  /** Quando o escritório repassa; nulo = mesma base da fábrica. */
  sellerCommissionBasis: string | null;
}
