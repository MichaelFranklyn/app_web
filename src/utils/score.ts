/**
 * Explicação do score de visita em linguagem simples.
 *
 * Leitura de cor/urgência (decisão de produto): quanto MAIOR o total, mais
 * URGENTE o cliente (cor quente/vermelha); score baixo = cliente tranquilo
 * (verde). Este util traduz as dimensões em motivos legíveis + o que fazer.
 *
 * O total vem do backend já normalizado em 0–100: cada dimensão vira fração do
 * próprio teto e recebe um peso (ver DEFAULT_PRIORITY_WEIGHTS em
 * calculate_visit_score.py). As dimensões continuam chegando em escala BRUTA —
 * por isso somar os cinco valores não reproduz o total.
 *
 * O peso da URGÊNCIA não é fixo: ele depende de `stockConfidence`, o lastro do
 * dado de estoque. Só ~15% dos clientes informam estoque com precisão, e no
 * resto da carteira `scoreUrgency` descreve uma projeção, não uma medição. O
 * que sobra do peso vai para as dimensões que têm lastro (ver
 * `effectiveWeights`). Por isso o valor bruto da urgência pode ser 100 e a
 * contribuição dela no total, zero — e é justamente essa diferença que a tela
 * precisa mostrar em vez de esconder.
 *
 * O score DECIDE a rotina (generate_weekly_schedule.py): a faixa "Urgente"
 * (>= URGENT_THRESHOLD) é a única que paga um deslocamento; da faixa "Atenção"
 * para baixo o cliente entra como LIGAÇÃO, e o "Tranquilo" só quando já passou
 * da fração do ciclo desde a última visita. `_ranking_score` sobrou apenas como
 * desempate.
 */

export type ScoreTone =
  | "red"
  | "orange"
  | "amber"
  | "blue"
  | "green"
  | "cyan"
  | "neutral";

/** Classe Tailwind de fundo (bolinha/indicador) por tom de score. */
export const SCORE_TONE_BG: Record<ScoreTone, string> = {
  red: "bg-(--red)",
  orange: "bg-(--orange)",
  amber: "bg-(--amber)",
  blue: "bg-(--blue)",
  green: "bg-(--green)",
  cyan: "bg-(--cyan)",
  neutral: "bg-(--muted)",
};

/**
 * De onde veio o dado de estoque que gerou a urgência (StockConfidence no
 * backend). Só ~15% dos clientes informam estoque com precisão: no resto da
 * carteira a "ruptura" é uma projeção sobre a última compra. Sem este eixo a
 * tela afirmava ruptura onde havia palpite.
 */
export type StockConfidence =
  | "confirmado"
  | "historico"
  | "fraco"
  | "sem_lastro";

/** Fração do peso da urgência que sobrevive em cada nível. Espelha
 * CONFIDENCE_FACTOR em stock_confidence.py.
 *
 * `sem_lastro` é 0.10 e não 0: uma ruptura PROJETADA vale um décimo da
 * prateleira vista — o bastante para ordenar a fila de ligações dentro dos ~85%
 * de carteira sem lastro, longe do bastante para pagar um deslocamento. */
const CONFIDENCE_FACTOR: Record<StockConfidence, number> = {
  confirmado: 1,
  historico: 0.8,
  fraco: 0.4,
  sem_lastro: 0.1,
};

/** Como a origem do número é dita ao vendedor. Linguagem concreta: "estimado"
 * e "confirmado" descrevem o que aconteceu, não o nível de um modelo. */
const CONFIDENCE_LABEL: Record<StockConfidence, string> = {
  confirmado: "confirmado na última visita",
  historico: "estimado pelo histórico de compras",
  fraco: "estimativa fraca — poucas compras registradas",
  sem_lastro: "estimativa sem histórico",
};

export const stockConfidenceLabel = (
  confidence: StockConfidence | string | null | undefined
): string =>
  CONFIDENCE_LABEL[confidence as StockConfidence] ??
  CONFIDENCE_LABEL.sem_lastro;

const confidenceFactor = (
  confidence: StockConfidence | string | null | undefined
): number => CONFIDENCE_FACTOR[confidence as StockConfidence] ?? 0;

export interface ScoreDimensions {
  scoreTotal: string;
  scoreUrgency: string;
  scorePriority: string;
  scoreFrequency: string;
  scorePotential: string;
  scoreRecency: string;
  /** Ausente nos scores gravados antes da coluna existir — tratado como
   * `sem_lastro`, o mesmo pior caso que o backend aplica. */
  stockConfidence?: StockConfidence | string | null;
}

export interface ScoreReason {
  key: string;
  label: string;
  value: number;
  why: string;
  /**
   * O mesmo motivo em três palavras ("Estoque acabando"), para onde não cabe a
   * frase inteira — a coluna de uma folha impressa, por exemplo.
   */
  short: string;
  /** O que fazer para mudar este fator; ausente quando é apenas informativo. */
  tip: string | null;
  tone: ScoreTone;
  /** Pontos que este fator adicionou ao total — define a ordem da lista. */
  contribution: number;
}

export interface ScoreLevel {
  label: string;
  tone: ScoreTone;
  summary: string;
}

export interface ScoreExplanation {
  total: number;
  level: ScoreLevel;
  reasons: ScoreReason[];
}

/**
 * Faixa de urgência do total (escala 0–100). Score ALTO = mais urgente
 * (quente/vermelho); score baixo = tranquilo (verde) — mesma direção do backend.
 *
 * Limiares calibrados sobre os cenários canônicos das regras, não por percentil.
 * Com o peso adaptativo, a régua passou a ser a PROCEDÊNCIA do dado de estoque:
 * uma ruptura de 15+ dias marca 57,8 se foi confirmada na visita, 47,5 se vem de
 * um histórico regular — as duas em "Urgente" — e 11,4 se é só a estimativa
 * padrão, que fica em "Tranquilo". Em compensação, o cliente sem dado de estoque
 * cujo ciclo venceu passa a alcançar "Urgente" pelo ciclo: é o critério que a
 * operação já usa ("visito a cada tantos dias") e que antes o motor ignorava.
 *
 * Um vínculo NUNCA VISITADO leva a recência cheia (20 brutos): 28,5 sozinho, e
 * 46,3 com prioridade alta. Antes ele somava 6,3 e ficava abaixo do piso da fila
 * de ligação — cliente novo não aparecia em rotina nenhuma.
 */
export const URGENT_THRESHOLD = 45;
const ATTENTION_THRESHOLD = 30;
const FOLLOW_THRESHOLD = 12;

export const scoreLevel = (total: number): ScoreLevel => {
  if (total >= URGENT_THRESHOLD)
    return {
      label: "Urgente",
      tone: "red",
      summary:
        "Este cliente precisa de atenção agora — a rotina agenda uma visita.",
    };
  if (total >= ATTENTION_THRESHOLD)
    return {
      label: "Atenção",
      tone: "orange",
      summary: "Vale um contato: a rotina agenda uma ligação, não uma visita.",
    };
  if (total >= FOLLOW_THRESHOLD)
    return {
      label: "Acompanhar",
      tone: "amber",
      summary:
        "Acompanhamento normal — entra na fila de ligações quando há vaga.",
    };
  return {
    label: "Tranquilo",
    tone: "green",
    summary: "Sem pendências. Recebe ligação só na metade do ciclo de visita.",
  };
};

/**
 * Uma fábrica "urgente" é a que cruza o limiar da faixa vermelha — o mesmo
 * limiar que o motor de rotina usa para decidir que o caso vale deslocamento
 * (VISIT_SCORE_THRESHOLD em generate_weekly_schedule.py).
 */
export const isUrgent = (total: number): boolean => total >= URGENT_THRESHOLD;

/** Rótulo + cor de prioridade para o card de visita (usa o nível do score). */
export const visitPriority = (
  total: number
): { label: string; tone: ScoreTone } => {
  const { label, tone } = scoreLevel(total);
  return { label, tone };
};

/**
 * Cor do total na paleta de ScoreCell/Progress. Deriva do mesmo nível da tag
 * (scoreLevel) para nunca divergir: a escala de urgência é única em tag, barra
 * e card — vermelho → laranja → âmbar → verde conforme o score desce (alto =
 * urgente, baixo = tranquilo).
 */
export const scoreBarColor = (
  total: number
): "red" | "orange" | "amber" | "green" =>
  scoreLevel(total).tone as "red" | "orange" | "amber" | "green";

interface DimensionMeta {
  key: keyof ScoreDimensions;
  label: string;
  tone: ScoreTone;
  why: string;
  /** Versão curta do `why`, para colunas estreitas (PDF da rota). */
  short: string;
  tip: string | null;
  /** Teto da dimensão na escala bruta (espelha _DIMENSION_MAX no backend). */
  max: number;
  /**
   * Fração NOMINAL do total (espelha DEFAULT_PRIORITY_WEIGHTS no backend). O
   * peso aplicado sai de `effectiveWeights`, que desconta a urgência sem
   * lastro — só coincide com este quando o estoque foi confirmado.
   */
  weight: number;
}

// Cada dimensão: a condição do cliente que ela representa e a ação sugerida.
const DIMENSIONS: DimensionMeta[] = [
  {
    key: "scoreUrgency",
    label: "Urgência",
    tone: "red",
    why: "O estoque do cliente está perto de acabar.",
    short: "Estoque acabando",
    tip: "Registre uma reposição ou um novo pedido para o cliente.",
    max: 100,
    weight: 0.55,
  },
  {
    key: "scoreFrequency",
    label: "Frequência",
    tone: "blue",
    why: "A visita está atrasada em relação ao ciclo combinado.",
    short: "Visita atrasada",
    tip: "Agende ou conclua uma visita para voltar ao ciclo.",
    max: 40,
    weight: 0.2,
  },
  {
    key: "scoreRecency",
    label: "Recência",
    tone: "cyan",
    why: "Faz tempo desde o último contato registrado.",
    short: "Sem contato há tempo",
    tip: "Faça um check-in / registre uma visita ao cliente.",
    max: 20,
    weight: 0.1,
  },
  {
    key: "scorePriority",
    label: "Prioridade",
    tone: "amber",
    why: "O cliente está marcado como prioridade alta.",
    short: "Cliente prioritário",
    tip: "Ajuste a prioridade no cadastro do vínculo, se já não for tão relevante.",
    max: 50,
    weight: 0.1,
  },
  {
    key: "scorePotential",
    label: "Potencial",
    tone: "green",
    why: "É um cliente de alto ticket (topo da curva ABC).",
    short: "Alto potencial",
    tip: null,
    max: 30,
    weight: 0.05,
  },
];

/**
 * Os pesos que a conta realmente usou, dado o lastro do sinal de estoque.
 * Espelha `effective_weights` em calculate_visit_score.py: a urgência entra com
 * `peso × k` e a massa liberada é redistribuída proporcionalmente entre as
 * outras quatro. Sem isso, um cliente sem dado de estoque teria os motivos
 * listados na ordem errada — "Urgência" no topo com contribuição zero, e o
 * ciclo (que de fato decidiu o score) lá embaixo.
 */
const effectiveWeights = (
  confidence: StockConfidence | string | null | undefined
): Record<string, number> => {
  const k = confidenceFactor(confidence);
  const nominal = Object.fromEntries(
    DIMENSIONS.map((meta) => [meta.key, meta.weight])
  );
  if (k === 1) return nominal;

  const urgency = nominal.scoreUrgency;
  const others = Object.entries(nominal)
    .filter(([key]) => key !== "scoreUrgency")
    .reduce((sum, [, weight]) => sum + weight, 0);
  if (others <= 0) return nominal;

  const scale = 1 + (urgency * (1 - k)) / others;
  return Object.fromEntries(
    Object.entries(nominal).map(([key, weight]) => [
      key,
      key === "scoreUrgency" ? urgency * k : weight * scale,
    ])
  );
};

/**
 * Quanto esta dimensão empurrou o total, em pontos do score (0–100).
 *
 * Ordenar pelo valor bruto engana: "Prioridade" chega a 50 e "Frequência" a 40,
 * mas ambas pesam menos que "Urgência", cujo teto é 100 e cujo peso é o dobro.
 */
const contribution = (
  meta: DimensionMeta,
  raw: number,
  weight: number
): number => (raw / meta.max) * weight * 100;

/**
 * Monta a explicação do score a partir das dimensões, listando os fatores que
 * contribuem (valor > 0), do que mais empurrou o total para o que menos empurrou.
 *
 * Os pesos aqui espelham o backend só para ORDENAR — o número exibido é sempre
 * o valor bruto vindo da API. Se os pesos divergirem, muda a ordem da lista,
 * nunca um valor mostrado ao usuário.
 */
export const explainScore = (dims: ScoreDimensions): ScoreExplanation => {
  const total = Number(dims.scoreTotal) || 0;
  // O backend tem uma distinção a mais que não chega aqui: quando não existe
  // ruptura NENHUMA ele usa k=0 em vez do piso de `sem_lastro`. Os dois casos são
  // indistinguíveis no score gravado (`stockConfidence` é `sem_lastro` nos dois),
  // e a diferença não muda nada do que esta função decide: com a urgência bruta
  // em 0 ela sai da lista de qualquer forma, e o peso liberado escala as outras
  // quatro por igual — mesma ordem. Tentar adivinhar a distinção por
  // `scoreUrgency === 0` seria pior: um estoque CONFIRMADO com folga também tem
  // urgência bruta 0, e ali o peso nominal é o correto.
  const weights = effectiveWeights(dims.stockConfidence);
  const reasons: ScoreReason[] = DIMENSIONS.map((meta) => ({
    key: meta.key,
    label: meta.label,
    value: Number(dims[meta.key]) || 0,
    // A urgência ganha a origem do dado colada no motivo: "o estoque está perto
    // de acabar" é uma afirmação diferente conforme alguém tenha olhado a
    // prateleira ou o sistema ter somado 30 dias à última compra.
    why:
      meta.key === "scoreUrgency"
        ? `${meta.why} (${stockConfidenceLabel(dims.stockConfidence)})`
        : meta.why,
    short: meta.short,
    tip: meta.tip,
    tone: meta.tone,
    contribution: contribution(
      meta,
      Number(dims[meta.key]) || 0,
      weights[meta.key] ?? meta.weight
    ),
  }))
    // Contribuição zero não é motivo: com o estoque sem lastro a urgência sai
    // da lista mesmo tendo valor bruto, porque ela não empurrou o total.
    .filter((reason) => reason.value > 0 && reason.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution);

  return { total, level: scoreLevel(total), reasons };
};
