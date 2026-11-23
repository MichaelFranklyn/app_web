export type VisitStatus =
  | "PENDING"
  | "COMPLETED"
  | "CLIENT_ABSENT"
  | "NO_TIME"
  | "RESCHEDULED"
  | "CANCELLED"
  /**
   * Ocorrência de DIA FIXO que não vai acontecer porque o próprio cliente pediu
   * para não ser procurado nesta data. O motor a registra e devolve a vaga do
   * dia — ela existe para ser lida, não para ser feita.
   *
   * Ninguém marca este status à mão: ele não entra em `VISIT_STATUS_OPTIONS`.
   */
  | "SKIPPED_BY_CUSTOMER";

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
  // Quem adiou foi o cliente, e é isso que o rótulo precisa dizer: "pulada"
  // soa como falha do vendedor, e ele não deixou de fazer nada.
  SKIPPED_BY_CUSTOMER: "Cliente adiou",
};

/** Cor de badge por status de visita (fonte única). */
export const VISIT_STATUS_COLOR: Record<VisitStatus, VisitStatusColor> = {
  PENDING: "neutral",
  COMPLETED: "green",
  CLIENT_ABSENT: "red",
  NO_TIME: "blue",
  RESCHEDULED: "blue",
  CANCELLED: "red",
  // Azul, como remarcada: é informação, não erro.
  SKIPPED_BY_CUSTOMER: "blue",
};

/**
 * Status que o sistema atribui sozinho e ninguém escolhe num formulário.
 *
 * "Cliente adiou" nasce da rotina quando um dia fixo cai numa data em que o
 * cliente pediu para não ser procurado. Oferecê-lo num select convidaria o
 * vendedor a marcá-lo numa visita comum, onde ele não significa nada — e o
 * campo é o mesmo em toda a tela de edição.
 */
const SYSTEM_ONLY_STATUSES: VisitStatus[] = ["SKIPPED_BY_CUSTOMER"];

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
  // "Ligação", e não "Contato" (19/10/2026): é a palavra de quem usa, e o
  // tipo que vier depois (WhatsApp) também é contato. Os dois rótulos são
  // femininos — as frases que concordam com eles usam "a".
  REMOTE: "Ligação",
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

const toOptions = (map: Record<string, string>) =>
  Object.entries(map).map(([value, label]) => ({ value, label }));

/** Opções de status/resultado de visita para selects (fonte única). */
export const VISIT_STATUS_OPTIONS = toOptions(VISIT_STATUS_LABEL).filter(
  (option) => !SYSTEM_ONLY_STATUSES.includes(option.value as VisitStatus)
);

/**
 * Status em que a parada SAIU do dia: outra visita ficou no lugar dela (ou o
 * cliente adiou a data). O backend recusa trocar esse status por outro — uma
 * conclusão gravada aqui iria para a parada errada. Nos formulários, o status
 * aparece só para leitura; as observações continuam editáveis.
 */
const LEFT_THE_DAY_STATUSES: VisitStatus[] = [
  "RESCHEDULED",
  "CANCELLED",
  "SKIPPED_BY_CUSTOMER",
];

export const isVisitStatusLocked = (status: string | null | undefined) =>
  LEFT_THE_DAY_STATUSES.includes(status as VisitStatus);

const LOCKED_STATUS_HINT: Record<string, string> = {
  RESCHEDULED:
    "Remarcada: o status não muda mais. Registre o resultado na visita que ficou no lugar desta.",
  CANCELLED:
    "Cancelada: o status não muda mais. As observações continuam editáveis.",
  SKIPPED_BY_CUSTOMER:
    "O cliente adiou esta data: o status não muda mais. As observações continuam editáveis.",
};

/** Explicação do status travado, ou `undefined` quando ele é editável. */
export const lockedVisitStatusHint = (status: string | null | undefined) =>
  status ? LOCKED_STATUS_HINT[status] : undefined;

/**
 * Opções do select de status para UMA visita. Um status só do sistema (cliente
 * adiou) não é escolhível, mas precisa aparecer quando é o atual — senão o
 * campo somente leitura fica vazio.
 */
export const visitStatusOptionsFor = (status: string | null | undefined) => {
  if (!status || VISIT_STATUS_OPTIONS.some((o) => o.value === status)) {
    return VISIT_STATUS_OPTIONS;
  }
  const label = VISIT_STATUS_LABEL[status as VisitStatus];
  return label
    ? [...VISIT_STATUS_OPTIONS, { value: status, label }]
    : VISIT_STATUS_OPTIONS;
};

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
