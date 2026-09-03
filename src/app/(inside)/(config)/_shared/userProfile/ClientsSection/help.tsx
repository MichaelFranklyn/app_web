/**
 * Ajuda das colunas da carteira de clientes.
 *
 * A carteira é por cliente E fábrica: o mesmo cliente aparece uma vez para cada
 * fábrica que compra dele, e é isso que a primeira linha da ajuda precisa dizer
 * — senão a contagem parece errada para quem conhece a carteira de cor.
 */
export const WALLET_COLUMN_HELP = {
  client:
    "Cliente que esta pessoa atende. Um cliente que compra de duas fábricas aparece em duas linhas — o vínculo é por cliente e fábrica.",
  factory:
    "Fábrica deste vínculo. Não ordena porque o nome mora em outra tabela; use o filtro para ver uma fábrica de cada vez.",
  priority:
    "O peso que o cliente tem na rotina desta pessoa. Prioridade alta entra antes na montagem da agenda de visitas.",
  frequency:
    "De quantos em quantos dias o cliente deve ser visitado. Vazio significa que o motor decide pelo comportamento de compra.",
  lastVisit: "Data da última visita concluída neste vínculo.",
} as const;
