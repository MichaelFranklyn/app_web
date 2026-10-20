/**
 * O texto da confirmação de "não vou trabalhar neste dia".
 *
 * Fica separado do componente porque é ele que carrega a regra que o vendedor
 * precisa entender antes de confirmar: a ação NÃO se limita ao dia. As paradas
 * mudam de data, e o que não couber na semana sai do plano. Dizer isso só
 * depois, no toast, seria dizer tarde demais.
 */
export interface DayOffConfirmation {
  title: string;
  description: string;
  confirmLabel: string;
}

export const buildDayOffConfirmation = (
  isDayOff: boolean,
  pendingCount: number
): DayOffConfirmation => {
  if (isDayOff) {
    return {
      title: "Voltar a trabalhar neste dia?",
      // O caminho de volta não é simétrico, e esconder isso criaria a
      // expectativa errada: as visitas que saíram já têm data nova e algumas
      // podem ter sido combinadas com o cliente. Trazê-las de volta seria
      // desmarcar um compromisso pelas costas de quem o assumiu.
      description:
        "O dia volta ao planejamento e pode receber visitas de novo. As paradas que saíram daqui NÃO voltam sozinhas — elas já foram remarcadas para outros dias.",
      confirmLabel: "Voltar a trabalhar",
    };
  }

  if (pendingCount === 0) {
    return {
      title: "Não vai trabalhar neste dia?",
      description:
        "O dia sai do planejamento: não recebe visita nova e o sistema não vai montar rota para ele. Não há nada marcado nele agora.",
      confirmLabel: "Não vou trabalhar",
    };
  }

  const paradas =
    pendingCount === 1
      ? "1 parada marcada"
      : `${pendingCount} paradas marcadas`;

  return {
    title: "Não vai trabalhar neste dia?",
    description: `Este dia tem ${paradas}. Elas vão para o próximo dia com vaga, seguindo a sua configuração de remarcação — e o que não couber nesta semana sai do plano (o cliente volta a ser recomendado pelo score).`,
    confirmLabel: "Não vou trabalhar",
  };
};
