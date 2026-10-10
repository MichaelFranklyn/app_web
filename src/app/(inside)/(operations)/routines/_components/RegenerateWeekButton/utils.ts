import {
  CalendarX,
  LucideIcon,
  MapPinned,
  RefreshCw,
  ThumbsDown,
} from "lucide-react";

/**
 * Por que refazer. `TRIP` não vai ao backend: quem vai atender uma região não
 * precisa de uma rotina refeita (ela sairia de casa de novo), precisa planejar
 * a viagem — a resposta leva direto ao planejador.
 */
export type RegenerateReason =
  | "TRIP"
  | "DATA_CHANGED"
  | "UNFORESEEN"
  | "BAD_PLAN"
  | "OTHER";

export interface ReasonOption {
  value: RegenerateReason;
  icon: LucideIcon;
  label: string;
  hint: string;
}

export const REASON_OPTIONS: ReasonOption[] = [
  {
    value: "TRIP",
    icon: MapPinned,
    label: "Vou atender uma região e não tinha planejado a viagem",
    hint: "Você escolhe as cidades e os dias; a rotina desses dias passa a ser a da região.",
  },
  {
    value: "DATA_CHANGED",
    icon: RefreshCw,
    label: "Entrou pedido, estoque ou cliente novo",
    hint: "A rotina é montada de novo com os dados de hoje.",
  },
  {
    value: "UNFORESEEN",
    icon: CalendarX,
    label: "Tive um imprevisto e a semana mudou",
    hint: "Os dias que ainda vêm são planejados de novo.",
  },
  {
    value: "BAD_PLAN",
    icon: ThumbsDown,
    label: "A rotina não ficou boa",
    hint: "Conte abaixo o que estava errado — é assim que o planejamento melhora.",
  },
  {
    value: "OTHER",
    icon: RefreshCw,
    label: "Outro motivo",
    hint: "Escreva abaixo em poucas palavras.",
  },
];

/** Motivos em que o texto é obrigatório: sem ele a resposta não diz nada. */
export const isNoteRequired = (reason: RegenerateReason | null): boolean =>
  reason === "OTHER";

/** Dá para seguir? Precisa de um motivo e, em "Outro", do texto. */
export const canSubmitReason = (
  reason: RegenerateReason | null,
  note: string
): boolean =>
  reason !== null && (!isNoteRequired(reason) || note.trim().length > 0);
