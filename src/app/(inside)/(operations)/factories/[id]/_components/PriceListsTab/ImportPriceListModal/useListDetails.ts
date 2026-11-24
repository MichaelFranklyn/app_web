import { useState } from "react";

import { ImportMode } from "./interface";

/**
 * Metadados da tabela de preço (nome, região e vigência) — o bloco de campos
 * livres do último passo, separado do mapeamento de colunas. Também guarda o
 * que a planilha é (`mode`) e, para outro grupo de clientes, em qual tabela
 * vigente os preços entram. `reset` volta ao estado inicial (vigência começa
 * hoje) quando o modal fecha.
 */
export function useListDetails() {
  const [listName, setListName] = useState("");
  const [region, setRegion] = useState("");
  const [validFrom, setValidFrom] = useState<Date | null>(new Date());
  const [validUntil, setValidUntil] = useState<Date | null>(null);
  const [mode, setMode] = useState<ImportMode>("replace");
  const [targetListId, setTargetListId] = useState<string | null>(null);

  const reset = () => {
    setListName("");
    setRegion("");
    setValidFrom(new Date());
    setValidUntil(null);
    setMode("replace");
    setTargetListId(null);
  };

  return {
    listName,
    setListName,
    region,
    setRegion,
    validFrom,
    setValidFrom,
    validUntil,
    setValidUntil,
    mode,
    setMode,
    targetListId,
    setTargetListId,
    reset,
  };
}
