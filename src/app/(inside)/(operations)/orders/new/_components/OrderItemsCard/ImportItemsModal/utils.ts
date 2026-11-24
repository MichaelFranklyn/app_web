import type { DraftMergeResult } from "../../../../../_shared/orderDraftItems";
import { plural } from "@/utils/format/plural";

/** O que a importação fez na lista, em uma frase — vai no toast. */
export function describeDraftImport({
  added,
  updated,
}: DraftMergeResult): string {
  const parts: string[] = [];
  if (added > 0) parts.push(plural(added, "item novo", "itens novos"));
  if (updated > 0)
    parts.push(
      `${plural(updated, "item já na lista", "itens já na lista")} com a quantidade da planilha`
    );
  if (parts.length === 0) return "Nenhum item foi levado para a lista.";
  return `${parts.join(" e ")}. Nada foi gravado ainda: confira e clique em “Criar pedido”.`;
}
