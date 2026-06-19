import { cn } from "@/lib/utils";
import { CardBg } from "../interface";
import { bgVariants, cardHeadStyle } from "../style";

// O header é um container query nomeado "cardhead": as ações reagem à largura
// real do próprio header (não da viewport), colapsando para ícone quando estreito.
export const headerStyle = cn(cardHeadStyle, "@container/cardhead");

export const headerBgVariants: Record<CardBg, string> = bgVariants;

export const headerContentStyle = "flex min-w-0 flex-1 flex-col gap-4 truncate";

export const headerActionsWrapperStyle = "flex shrink-0 items-center gap-6";

// Ponto de corte: abaixo de 480px de largura do header, o texto das ações some
// e o botão vira icon-only (com tooltip). Compartilhado entre Card.Header.Action
// e usos manuais (ex.: triggers de modal) para manter o comportamento consistente.
export const headerActionLabelStyle = "hidden @min-[480px]/cardhead:inline";
