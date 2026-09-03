/** Normaliza para comparar: sobra e caixa não decidem qual condição é qual. */
const normalize = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");

/**
 * A condição de pagamento cujo NOME é o que veio escrito.
 *
 * A ficha de pedido offline guarda o nome da condição ("30/45/60"), não o id —
 * ela é preenchida sem internet, e nome é o que o vendedor escolhe na lista. Na
 * volta, é preciso reencontrar o id.
 *
 * Casar pelo RÓTULO da opção não serve: ele é montado para a tela e leva os
 * dias e o piso junto ("30/45/60 (30/45/60) · mínimo R$ 3.000,00"). Comparar com
 * ele nunca dá certo — e o silêncio disso é o pior: a ficha sobe, o prazo volta
 * em branco e ninguém entende por quê.
 */
export const findTermIdByName = (
  terms: { id: string; name: string }[],
  name: string
): string | null => {
  if (!name.trim()) return null;
  const wanted = normalize(name);
  return terms.find((term) => normalize(term.name) === wanted)?.id ?? null;
};

/**
 * Como se chama uma condição de pagamento na tela: **o prazo**.
 *
 * "45/60/90 dias" — e não "45/60/90 (45/60/90)", que era o que saía quando o
 * rótulo repetia o nome cadastrado ao lado dos dias. O nome só aparece quando
 * não há dias para mostrar ("À vista", "Antecipado"): aí ele é a única coisa
 * que descreve a condição.
 */
export const paymentTermLabel = (
  term: { name: string; installmentsDays?: number[] | null } | null | undefined
): string => {
  if (!term) return "—";
  const days = term.installmentsDays ?? [];
  return days.length ? `${days.join("/")} dias` : term.name;
};
