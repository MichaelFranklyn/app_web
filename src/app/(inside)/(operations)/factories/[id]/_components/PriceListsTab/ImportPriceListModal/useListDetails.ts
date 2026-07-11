import { useState } from "react";

/**
 * Metadados da tabela de preço (nome, região e vigência) — o bloco de campos
 * livres do último passo, separado do mapeamento de colunas. `reset` volta ao
 * estado inicial (vigência começa hoje) quando o modal fecha.
 */
export function useListDetails() {
  const [listName, setListName] = useState("");
  const [region, setRegion] = useState("");
  const [validFrom, setValidFrom] = useState<Date | null>(new Date());
  const [validUntil, setValidUntil] = useState<Date | null>(null);

  const reset = () => {
    setListName("");
    setRegion("");
    setValidFrom(new Date());
    setValidUntil(null);
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
    reset,
  };
}
