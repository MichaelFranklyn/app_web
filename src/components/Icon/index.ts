/**
 * Escala única do ícone solto (o `size` do lucide). Antes cada tela escolhia o
 * número — 12, 13, 14, 16, 18, 20 —, e dois ícones lado a lado na mesma linha
 * saíam com 1–2px de diferença. Cinco degraus bastam:
 *
 * - `xs` 12: dentro de selo, chip e texto `micro`.
 * - `sm` 14: ao lado de texto `body-sm`/`body-xs` (link, linha de lista, meta).
 * - `md` 16: padrão — botão, campo, título de card.
 * - `lg` 20: ícone que é o destaque da linha (fila do console, aviso de topo).
 * - `xl` 24: área de soltar arquivo, ilustração pequena.
 *
 * Ícone dentro de peça que já fixa o svg (`EmptyState.Icon`, `IconTile`,
 * `Alert.Icon`) NÃO passa `size` — a peça decide.
 */
export const ICON_SIZE = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 } as const;

export type IconSize = keyof typeof ICON_SIZE;
