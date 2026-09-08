import type { CommissionStatus } from "./utils";

/**
 * De quem é o dinheiro de um papel de comissão: o do escritório ou o do
 * vendedor.
 *
 * Mora no pai comum porque as duas rotas de comissão emitem os mesmos dois
 * papéis — o fechamento de `/commissions` e o relatório do período em
 * `/dashboard/reports/commissions`. Se cada uma decidisse a ótica por conta, um
 * mesmo mês sairia com nomes e regras diferentes em duas folhas que o gestor põe
 * lado a lado.
 */
export type CommissionAudience = "office" | "seller";

/** O que a lente precisa ler de uma linha — os dois níveis da mesma parcela. */
export interface CommissionLevels {
  amount: string;
  receiveDate: string | null;
  status: CommissionStatus;
  sellerAmount: string;
  sellerReceiveDate: string | null;
  sellerStatus: CommissionStatus;
}

/**
 * De quem é o dinheiro que o relatório conta.
 *
 * Cada parcela carrega DUAS comissões, com valores, datas e situações próprios:
 * a do escritório (`amount`/`receiveDate`/`status`, o que a fábrica repassa) e a
 * do vendedor (`sellerAmount`/`sellerReceiveDate`/`sellerStatus`, a fatia que o
 * escritório repassa depois). Elas não coincidem — nem no valor nem no mês, já
 * que o vendedor recebe no ciclo dele.
 *
 * O fechamento em PDF ignorava isso e somava sempre os campos do escritório.
 * O papel de um vendedor específico saía com o valor cheio da comissão: ele lia
 * o próprio nome no cabeçalho e o dinheiro do escritório na coluna.
 *
 * A lente resolve isso num lugar só. Quem monta o papel escolhe a ótica, e todo
 * o resto — filtro do mês, subtotal por fábrica, total, prévia do mês seguinte,
 * linha impressa — passa a ler pelos mesmos três campos.
 *
 * Ela carrega também os RÓTULOS, e não só as leituras: quem paga muda com a
 * ótica (a fábrica paga o escritório; o escritório repassa o vendedor), e um
 * fechamento que diz "a receber das fábricas" sobre a fatia do vendedor está
 * mentindo sobre a fonte do dinheiro. Deixar o texto junto da leitura é o que
 * impede os dois de andarem separados.
 */
export interface CommissionLens {
  /** De quem é o dinheiro. Governa os textos, não a leitura dos campos. */
  audience: CommissionAudience;
  /** Título da faixa do papel — a primeira coisa que se lê. */
  title: string;
  /** Uma linha, sob o cabeçalho, dizendo de quem é o valor das colunas. */
  caption: string;
  /** Como a coluna de dinheiro se chama quando ela está sozinha na folha. */
  amountHeader: string;
  /** Quem ainda deve, no fechamento do fim do papel. */
  receivableLabel: string;
  /** Quem já pagou, no fechamento do fim do papel. */
  receivedLabel: string;
  /** Sufixo do nome do arquivo, para os dois papéis não se sobrescreverem. */
  fileTag: string;
  amount: (row: CommissionLevels) => number;
  receiveDate: (row: CommissionLevels) => string | null;
  status: (row: CommissionLevels) => CommissionStatus;
}

/** Leitura dos campos PRINCIPAIS da linha — o nível de quem pediu a lista. */
const mainFields = {
  amount: (row: CommissionLevels) => Number(row.amount),
  receiveDate: (row: CommissionLevels) => row.receiveDate,
  status: (row: CommissionLevels) => row.status,
};

/** A ótica do escritório: o que a fábrica repassa, no ciclo da fábrica. */
export const OFFICE_LENS: CommissionLens = {
  audience: "office",
  title: "FECHAMENTO DO ESCRITÓRIO",
  caption:
    "Valores: a comissão que as fábricas pagam ao escritório — é o papel que se confere contra a planilha da fábrica.",
  amountHeader: "COMISSÃO",
  receivableLabel: "A receber das fábricas",
  receivedLabel: "Já recebido das fábricas",
  fileTag: "escritorio",
  ...mainFields,
};

/**
 * A ótica do vendedor vista pelo GESTOR: a fatia dele, no ciclo dele, lida dos
 * campos `seller*` — os principais, aqui, são o nível do escritório.
 */
export const SELLER_LENS: CommissionLens = {
  audience: "seller",
  title: "EXTRATO DO VENDEDOR",
  caption:
    "Valores: a fatia do vendedor — o repasse do escritório, no ciclo de pagamento dele. Não é o que a fábrica paga ao escritório.",
  amountHeader: "COMISSÃO",
  receivableLabel: "A receber do escritório",
  receivedLabel: "Já repassado pelo escritório",
  fileTag: "vendedor",
  amount: (row) => Number(row.sellerAmount),
  receiveDate: (row) => row.sellerReceiveDate,
  status: (row) => row.sellerStatus,
};

/**
 * A ótica do vendedor quando é ELE quem abre a tela.
 *
 * O texto é o mesmo do extrato, mas a leitura é a dos campos principais: o
 * backend monta a lista no nível de quem pergunta (ver `ListCommissionsUseCase`,
 * `seller_view`), então para o vendedor logado `amount` JÁ é a fatia dele. Ler
 * `sellerAmount` aqui daria o mesmo número — o que separa as duas lentes é não
 * depender disso: se um dia a lista passar a vir sempre no nível do escritório,
 * é esta lente que precisa mudar, e o teste que a prende diz por quê.
 */
export const OWN_SELLER_LENS: CommissionLens = {
  ...SELLER_LENS,
  ...mainFields,
};

/**
 * A lente de um papel.
 *
 * São duas perguntas diferentes, e misturá-las foi o defeito original:
 * `audience` diz DE QUEM é o dinheiro (o gestor escolhe na hora de gerar), e
 * `isManager` diz QUAIS CAMPOS carregam esse dinheiro — só o gestor recebe os
 * dois níveis na mesma linha; para o vendedor existe um nível só, o dele.
 */
export const lensFor = (
  audience: CommissionAudience,
  isManager: boolean
): CommissionLens => {
  if (!isManager) return OWN_SELLER_LENS;
  return audience === "seller" ? SELLER_LENS : OFFICE_LENS;
};
