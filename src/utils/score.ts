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
 * Atenção: o score NÃO é o que ordena a rotina do dia. O agendamento usa
 * `_ranking_score` (prioridade + dias de atraso), em generate_weekly_schedule.py.
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

export interface ScoreDimensions {
  scoreTotal: string;
  scoreUrgency: string;
  scorePriority: string;
  scoreFrequency: string;
  scorePotential: string;
  scoreRecency: string;
}

export interface ScoreReason {
  key: string;
  label: string;
  value: number;
  why: string;
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
 * Limiares calibrados sobre os cenários canônicos das regras, não por percentil:
 * um cliente com ruptura de estoque de 15+ dias marca 57,8 e cai em "Urgente";
 * um cliente sem ruptura, mesmo com prioridade alta e ciclo estourado, marca
 * 35,8 e fica em "Atenção". Só chega a "Urgente" sem ruptura quem tem as outras
 * quatro dimensões no teto (exatamente 45,0).
 */
export const URGENT_THRESHOLD = 45;
const ATTENTION_THRESHOLD = 30;
const FOLLOW_THRESHOLD = 12;

export const scoreLevel = (total: number): ScoreLevel => {
  if (total >= URGENT_THRESHOLD)
    return {
      label: "Urgente",
      tone: "red",
      summary: "Este cliente precisa de atenção agora — priorize uma visita.",
    };
  if (total >= ATTENTION_THRESHOLD)
    return {
      label: "Atenção",
      tone: "orange",
      summary: "Vale agendar uma visita em breve.",
    };
  if (total >= FOLLOW_THRESHOLD)
    return {
      label: "Acompanhar",
      tone: "amber",
      summary: "Mantenha o acompanhamento normal deste cliente.",
    };
  return {
    label: "Tranquilo",
    tone: "green",
    summary: "Sem pendências relevantes no momento.",
  };
};

/** Uma fábrica "urgente" é a que cruza o limiar da faixa vermelha. */
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
  tip: string | null;
  /** Teto da dimensão na escala bruta (espelha _DIMENSION_MAX no backend). */
  max: number;
  /** Fração do total (espelha DEFAULT_PRIORITY_WEIGHTS no backend). */
  weight: number;
}

// Cada dimensão: a condição do cliente que ela representa e a ação sugerida.
const DIMENSIONS: DimensionMeta[] = [
  {
    key: "scoreUrgency",
    label: "Urgência",
    tone: "red",
    why: "O estoque do cliente está perto de acabar.",
    tip: "Registre uma reposição ou um novo pedido para o cliente.",
    max: 100,
    weight: 0.55,
  },
  {
    key: "scoreFrequency",
    label: "Frequência",
    tone: "blue",
    why: "A visita está atrasada em relação ao ciclo combinado.",
    tip: "Agende ou conclua uma visita para voltar ao ciclo.",
    max: 40,
    weight: 0.2,
  },
  {
    key: "scoreRecency",
    label: "Recência",
    tone: "cyan",
    why: "Faz tempo desde o último contato registrado.",
    tip: "Faça um check-in / registre uma visita ao cliente.",
    max: 20,
    weight: 0.1,
  },
  {
    key: "scorePriority",
    label: "Prioridade",
    tone: "amber",
    why: "O cliente está marcado como prioridade alta.",
    tip: "Ajuste a prioridade no cadastro do vínculo, se já não for tão relevante.",
    max: 50,
    weight: 0.1,
  },
  {
    key: "scorePotential",
    label: "Potencial",
    tone: "green",
    why: "É um cliente de alto ticket (topo da curva ABC).",
    tip: null,
    max: 30,
    weight: 0.05,
  },
];

/**
 * Quanto esta dimensão empurrou o total, em pontos do score (0–100).
 *
 * Ordenar pelo valor bruto engana: "Prioridade" chega a 50 e "Frequência" a 40,
 * mas ambas pesam menos que "Urgência", cujo teto é 100 e cujo peso é o dobro.
 */
const contribution = (meta: DimensionMeta, raw: number): number =>
  (raw / meta.max) * meta.weight * 100;

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
  const reasons: ScoreReason[] = DIMENSIONS.map((meta) => ({
    key: meta.key,
    label: meta.label,
    value: Number(dims[meta.key]) || 0,
    why: meta.why,
    tip: meta.tip,
    tone: meta.tone,
    contribution: contribution(meta, Number(dims[meta.key]) || 0),
  }))
    .filter((reason) => reason.value > 0)
    .sort((a, b) => b.contribution - a.contribution);

  return { total, level: scoreLevel(total), reasons };
};
