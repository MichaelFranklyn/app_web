/** A cor do tipo de compromisso — é ela que se lê de relance na semana. */
export type EventChipTone = "amber" | "blue";

/**
 * Fundo branco e a BORDA ESQUERDA na cor do tipo: visita âmbar, ligação azul,
 * com o lado esquerdo quase reto, 3px (o `!` vence o `rounded-*` do card e do chip, que
 * no CSS gerado viria depois). O hover e o foco seguem a cor do tipo: a borda
 * inteira acende e o fundo ganha o tom claro dela.
 * O fundo colorido (7%, 20%, 70%) foi tentado e recusado — tingia a semana
 * inteira e brigava com o cinza do texto e as cores das etiquetas.
 */
export const EVENT_CHIP_STYLE: Record<EventChipTone, string> = {
  amber:
    "border border-l-5 border-l-(--amber) bg-(--bg2) rounded-l-[3px]! hover:border-(--amber) hover:bg-(--amber-bg) focus-visible:ring-(--amber)",
  blue: "border border-l-5 border-l-(--blue) bg-(--bg2) rounded-l-[3px]! hover:border-(--blue) hover:bg-(--blue-bg) focus-visible:ring-(--blue)",
};
