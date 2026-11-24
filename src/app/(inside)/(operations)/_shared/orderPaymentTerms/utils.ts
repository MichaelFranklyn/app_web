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

interface TieredTerm {
  id: string;
  priceTierId?: string | null;
  minOrderAmount?: number | null;
}

/** 0 = do nível do cliente, 1 = de todos os níveis, 2 = de outro nível. */
const tierRank = (term: TieredTerm, tierId: string | null): number => {
  if (!term.priceTierId) return 1;
  return term.priceTierId === tierId ? 0 : 2;
};

/**
 * Condições na ordem em que o vendedor deve vê-las: as do nível do cliente
 * primeiro (o interior compra em 45/75/105, não em 30/60/90), depois as que
 * valem para todos, por último as de outro nível. Dentro de cada grupo, a
 * ordem que veio. Sem nível conhecido, nada muda.
 */
export const sortTermsForTier = <T extends TieredTerm>(
  terms: T[],
  tierId: string | null
): T[] => {
  if (!tierId) return terms;
  return terms
    .map((term, index) => ({ term, index }))
    .sort(
      (a, b) =>
        tierRank(a.term, tierId) - tierRank(b.term, tierId) || a.index - b.index
    )
    .map(({ term }) => term);
};

/**
 * A condição que o pedido já traz escolhida para este cliente: a do nível
 * dele com o MENOR mínimo (a que qualquer pedido alcança). Sem condição do
 * nível, nenhuma — "todos os níveis" não diz qual o cliente costuma usar.
 */
export const suggestTermId = (
  terms: TieredTerm[],
  tierId: string | null
): string | null => {
  if (!tierId) return null;
  const own = terms.filter((term) => term.priceTierId === tierId);
  if (own.length === 0) return null;
  return own.reduce((best, term) =>
    (term.minOrderAmount ?? 0) < (best.minOrderAmount ?? 0) ? term : best
  ).id;
};
