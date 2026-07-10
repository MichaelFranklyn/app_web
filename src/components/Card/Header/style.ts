import { cn } from "@/lib/utils";
import { CardBg } from "../interface";
import { bgVariants, cardHeadStyle } from "../style";

// O header tem 3 estágios, escolhidos por MEDIÇÃO do conteúdo real (ver
// useHeaderActionsMode) — não por breakpoints de pixel fixos. O estágio vigente
// fica no atributo data-actions-mode; os filhos reagem via group-data.
//   • full   → cabe ícone + texto → ações em linha, à direita do título.
//   • icon   → só o ícone cabe → ações em linha, botões sem texto.
//   • column → nem o ícone cabe → ações descem e empilham, cada item full-width.
// `group/cardhead` nomeia o grupo para os filhos lerem o estágio do header.
export const headerStyle = cn(cardHeadStyle, "group/cardhead");

export const headerBgVariants: Record<CardBg, string> = bgVariants;

// Conteúdo (eyebrow/título/descrição): divide a linha com as ações nos estágios
// de linha (full/icon); ocupa a linha inteira quando as ações descem (column).
export const headerContentStyle = cn(
  "flex min-w-0 flex-col gap-4",
  "w-auto flex-1",
  "group-data-[actions-mode=column]/cardhead:w-full",
  "group-data-[actions-mode=column]/cardhead:flex-none"
);

// Wrapper das ações: no tamanho natural à direita (full/icon); full-width numa
// linha própria (column).
export const headerActionsWrapperStyle = cn(
  "flex shrink-0 items-center justify-end gap-6",
  "w-auto",
  "group-data-[actions-mode=column]/cardhead:w-full"
);

// Texto das ações (usado por Card.Header.Action e triggers de modal): escondido
// só no estágio `icon`. Nos demais (full e column, onde há espaço) fica visível.
export const headerActionLabelStyle =
  "inline group-data-[actions-mode=icon]/cardhead:hidden";
