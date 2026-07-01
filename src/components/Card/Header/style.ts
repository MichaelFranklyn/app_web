import { cn } from "@/lib/utils";
import { CardBg } from "../interface";
import { bgVariants, cardHeadStyle } from "../style";

// O header é um container query nomeado "cardhead": as ações reagem à largura
// real do próprio header (não da viewport), colapsando para ícone quando estreito.
export const headerStyle = cn(cardHeadStyle, "@container/cardhead");

export const headerBgVariants: Record<CardBg, string> = bgVariants;

// Conteúdo (eyebrow/título/descrição): ocupa a linha inteira quando o header é
// estreito (título quebra em linhas em vez de virar "..."); divide a linha com
// as ações a partir de 480px de largura do header.
export const headerContentStyle =
  "flex w-full min-w-0 flex-col gap-4 @min-[480px]/cardhead:w-auto @min-[480px]/cardhead:flex-1";

// Ações: linha própria (full width) no estreito; ao lado do título no largo.
export const headerActionsWrapperStyle =
  "flex w-full shrink-0 items-center justify-end gap-6 @min-[480px]/cardhead:w-auto";

// Ponto de corte: abaixo de 480px de largura do header, o texto das ações some
// e o botão vira icon-only (com tooltip). Compartilhado entre Card.Header.Action
// e usos manuais (ex.: triggers de modal) para manter o comportamento consistente.
export const headerActionLabelStyle = "hidden @min-[480px]/cardhead:inline";
