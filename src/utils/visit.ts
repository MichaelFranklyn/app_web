export type VisitStatus =
  | "PENDING"
  | "COMPLETED"
  | "CLIENT_ABSENT"
  | "NO_TIME"
  | "RESCHEDULED"
  | "CANCELLED";

export type VisitOutcome =
  | "SOLD"
  | "NOT_BOUGHT"
  | "RESCHEDULED"
  | "CLOSED"
  /** Só em contato remoto: o cliente pediu a visita presencial. */
  | "WANTS_VISIT"
  /** Só em contato remoto: o cliente dispensou a visita por ora. */
  | "NO_VISIT_NEEDED";

export type VisitStatusColor = "green" | "amber" | "neutral" | "red" | "blue";

/** Rótulos de exibição dos status de visita (fonte única). */
export const VISIT_STATUS_LABEL: Record<VisitStatus, string> = {
  PENDING: "Pendente",
  COMPLETED: "Realizada",
  CLIENT_ABSENT: "Cliente ausente",
  NO_TIME: "Sem tempo",
  RESCHEDULED: "Remarcada",
  CANCELLED: "Cancelada",
};

/** Cor de badge por status de visita (fonte única). */
export const VISIT_STATUS_COLOR: Record<VisitStatus, VisitStatusColor> = {
  PENDING: "neutral",
  COMPLETED: "green",
  CLIENT_ABSENT: "red",
  NO_TIME: "blue",
  RESCHEDULED: "blue",
  CANCELLED: "red",
};

/**
 * Como o vendedor toca o cliente: indo até lá ou à distância.
 *
 * REMOTE cobre ligação e WhatsApp juntos — o canal é escolha do vendedor na
 * hora e não muda nada na rotina, então não vira um tipo separado.
 */
export type VisitContactType = "IN_PERSON" | "REMOTE";

/** Rótulo do tipo de toque (fonte única entre routines e clients). */
export const CONTACT_TYPE_LABEL: Record<VisitContactType, string> = {
  IN_PERSON: "Visita",
  REMOTE: "Contato",
};

/**
 * Tudo que não é explicitamente REMOTE é visita presencial.
 *
 * O tipo pode chegar ausente por dois caminhos reais: um backend ainda defasado
 * (o campo só existe depois da migration `a4c8e2f6b1d9`) e o cache semeado no
 * SSR. Como o default da coluna é `presencial`, cair em IN_PERSON diz a verdade
 * — e derrubar o card inteiro por causa de um campo faltando seria um preço
 * absurdo por uma palavra de rótulo.
 */
export const asContactType = (
  contactType: VisitContactType | null | undefined
): VisitContactType => (contactType === "REMOTE" ? "REMOTE" : "IN_PERSON");

/** Rótulo do tipo, tolerante a valor ausente. */
export const contactLabel = (
  contactType: VisitContactType | null | undefined
): string => CONTACT_TYPE_LABEL[asContactType(contactType)];

/** O mesmo rótulo em minúscula, para caber no meio de uma frase. */
export const contactNoun = (
  contactType: VisitContactType | null | undefined
): string => contactLabel(contactType).toLowerCase();

/** Concordância de gênero: "a visita" × "o contato". */
export const contactArticle = (
  contactType: VisitContactType | null | undefined
): string => (asContactType(contactType) === "REMOTE" ? "o" : "a");

const toOptions = (map: Record<string, string>) =>
  Object.entries(map).map(([value, label]) => ({ value, label }));

/** Opções de status/resultado de visita para selects (fonte única). */
export const VISIT_STATUS_OPTIONS = toOptions(VISIT_STATUS_LABEL);

export const VISIT_OUTCOME_OPTIONS = [
  { value: "SOLD", label: "Vendeu" },
  { value: "NOT_BOUGHT", label: "Não comprou" },
  { value: "RESCHEDULED", label: "Reagendou" },
  { value: "CLOSED", label: "Fechado" },
];

/**
 * Resultados exclusivos do contato remoto: a pergunta "quer que eu passe aí?".
 * São eles que fazem a próxima visita ser antecipada ou adiada no back — não
 * são rótulo de histórico.
 */
export const REMOTE_OUTCOME_OPTIONS = [
  { value: "WANTS_VISIT", label: "Quer que eu passe lá" },
  { value: "NO_VISIT_NEEDED", label: "Não precisa agora" },
  { value: "SOLD", label: "Fez pedido" },
  { value: "NOT_BOUGHT", label: "Não comprou" },
];

/** Opções de resultado adequadas ao tipo de toque. */
export const outcomeOptionsFor = (
  contactType: VisitContactType | null | undefined
) =>
  asContactType(contactType) === "REMOTE"
    ? REMOTE_OUTCOME_OPTIONS
    : VISIT_OUTCOME_OPTIONS;

/**
 * Rótulo de QUALQUER resultado, para exibir histórico — visita e contato
 * aparecem na mesma tabela. Nos valores que os dois conjuntos compartilham
 * (SOLD, NOT_BOUGHT) vence a palavra da VISITA, que é o vocabulário já em uso:
 * o histórico não deveria mudar de texto por causa desta funcionalidade.
 */
export const ALL_OUTCOME_LABEL: Record<string, string> = Object.fromEntries(
  [...REMOTE_OUTCOME_OPTIONS, ...VISIT_OUTCOME_OPTIONS].map((o) => [
    o.value,
    o.label,
  ])
);
