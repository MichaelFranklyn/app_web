/**
 * Ajuda das colunas de "Fábricas com acesso".
 *
 * O acesso por fábrica era uma tabela cruzada em /settings/users, com a sua
 * própria ajuda; ela saiu porque a informação é do VÍNCULO, e vínculo se lê
 * pelas pontas — a pessoa aqui, a fábrica na aba de vendedores dela. Os textos
 * vieram junto.
 */
export const FACTORY_ACCESS_COLUMN_HELP = {
  factory:
    "Fábrica que esta pessoa pode vender. O nome mostrado é o apelido que a sua empresa deu a ela, quando existe.",
  status:
    "Se a permissão está valendo. Suspender tira a fábrica da vista do vendedor sem apagar nada do que já foi feito.",
  commission:
    "Quanto esta pessoa ganha por pedido NESTA fábrica, em % do valor do pedido, e quando o escritório repassa. O que sobrar da comissão que a fábrica paga fica no escritório.",
  grantedBy: "Quem concedeu o acesso — fica registrado para conferência.",
  date: "Quando o acesso foi concedido.",
  actions:
    "Ajustar a comissão do vendedor nesta fábrica, suspender ou remover o acesso.",
} as const;
