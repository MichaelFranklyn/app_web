/**
 * Explicação do score de visita em linguagem simples.
 *
 * Leitura de cor/urgência (decisão de produto): quanto MAIOR o total, mais
 * URGENTE o cliente (cor quente/vermelha); score baixo = cliente tranquilo
 * (verde). Alinhado ao backend, que soma fatores de urgência (ruptura vale até
 * 100) e prioriza score alto no ranking de rotas. Este util traduz as
 * dimensões em motivos legíveis + o que fazer.
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
 * Faixa de urgência do total. Score ALTO = mais urgente (quente/vermelho);
 * score baixo = tranquilo (verde) — mesma direção do backend.
 */
export const scoreLevel = (total: number): ScoreLevel => {
  if (total >= 61)
    return {
      label: "Urgente",
      tone: "red",
      summary: "Este cliente precisa de atenção agora — priorize uma visita.",
    };
  if (total >= 41)
    return {
      label: "Atenção",
      tone: "orange",
      summary: "Vale agendar uma visita em breve.",
    };
  if (total >= 21)
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
}

// Cada dimensão: a condição do cliente que ela representa e a ação sugerida.
const DIMENSIONS: DimensionMeta[] = [
  {
    key: "scoreUrgency",
    label: "Urgência",
    tone: "red",
    why: "O estoque do cliente está perto de acabar.",
    tip: "Registre uma reposição ou um novo pedido para o cliente.",
  },
  {
    key: "scoreFrequency",
    label: "Frequência",
    tone: "blue",
    why: "A visita está atrasada em relação ao ciclo combinado.",
    tip: "Agende ou conclua uma visita para voltar ao ciclo.",
  },
  {
    key: "scoreRecency",
    label: "Recência",
    tone: "cyan",
    why: "Faz tempo desde o último contato registrado.",
    tip: "Faça um check-in / registre uma visita ao cliente.",
  },
  {
    key: "scorePriority",
    label: "Prioridade",
    tone: "amber",
    why: "O cliente está marcado como prioridade alta.",
    tip: "Ajuste a prioridade no cadastro do vínculo, se já não for tão relevante.",
  },
  {
    key: "scorePotential",
    label: "Potencial",
    tone: "green",
    why: "É um cliente de alto ticket (topo da curva ABC).",
    tip: null,
  },
];

/**
 * Monta a explicação do score a partir das dimensões, listando os fatores que
 * contribuem (valor > 0), do maior para o menor.
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
  }))
    .filter((reason) => reason.value > 0)
    .sort((a, b) => b.value - a.value);

  return { total, level: scoreLevel(total), reasons };
};
