import { FormBuilderRef } from "@/components/FormBuilder";
import { RefObject, useEffect } from "react";

import { CoverageCadence, suggestCoverageDays } from "./coverageSuggestion";

/**
 * Preenche `coverageDays` sozinho quando o vínculo do pedido fica conhecido.
 *
 * Reage à SELEÇÃO, não ao digitar: o valor aparece assim que o cliente (ou o
 * vínculo, na aba da fábrica) é escolhido, no mesmo padrão da sugestão de preço
 * do item. Trocar de cliente troca a sugestão, porque o número descreve a
 * prateleira daquele cliente.
 *
 * O que o vendedor já digitou nunca é sobrescrito — a sugestão é ponto de
 * partida, e apagar por cima do que ele acabou de corrigir seria a pior forma
 * possível de "ajudar".
 *
 * As dependências são os campos PRIMITIVOS da cadência, e não o objeto: quem
 * chama costuma resolvê-lo com um `find` a cada render, e depender da
 * identidade faria o efeito rodar sem que nada tivesse mudado.
 */
export function useCoverageSuggestion(
  formRef: RefObject<FormBuilderRef | null>,
  cadence: CoverageCadence | null | undefined,
  isEnabled: boolean = true
) {
  const days = cadence?.days ?? null;
  const source = cadence?.source ?? null;

  useEffect(() => {
    if (!isEnabled || days === null || source === null) return;
    const suggested = suggestCoverageDays({ days, source });
    if (suggested === null) return;

    const current = formRef.current?.getValues()?.coverageDays;
    const isEmpty = current === undefined || current === null || current === "";
    if (!isEmpty) return;

    formRef.current?.setValue("coverageDays", suggested);
  }, [formRef, days, source, isEnabled]);
}
