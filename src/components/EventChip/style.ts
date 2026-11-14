/** A cor do tipo de compromisso — é ela que se lê de relance na semana. */
export type EventChipTone = "amber" | "blue";

/**
 * Fundo branco e a BORDA ESQUERDA na cor do tipo: visita âmbar, ligação azul,
 * com o lado esquerdo quase reto, 3px. Sem `!`: o `rounded-l-*` mexe só nos cantos
 * esquerdos e o Tailwind o emite DEPOIS do `rounded-*` do card e do chip (o
 * atalho `border-radius` vem antes dos cantos na ordem de propriedades). O hover e o foco seguem a cor do tipo: a borda
 * inteira acende e o fundo ganha o tom claro dela.
 * O fundo colorido (7%, 20%, 70%) foi tentado e recusado — tingia a semana
 * inteira e brigava com o cinza do texto e as cores das etiquetas.
 */
export const EVENT_CHIP_STYLE: Record<EventChipTone, string> = {
  amber:
    "border border-(--border) border-l-5 border-l-(--amber) bg-(--bg2) rounded-l-[3px] hover:border-(--amber) hover:bg-(--amber-bg)",
  blue: "border border-(--border) border-l-5 border-l-(--color-status-info) bg-(--bg2) rounded-l-[3px] hover:border-(--color-status-info) hover:bg-(--color-status-info-bg)",
};
