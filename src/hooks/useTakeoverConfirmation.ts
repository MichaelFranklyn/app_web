"use client";

import { useState } from "react";

/**
 * A confirmação de transferência NUNCA divide a tela com o formulário.
 *
 * Modal sobre modal é proibido: o usuário perde a noção de qual está fechando.
 * Então o formulário SAI de cena antes de a confirmação entrar, e volta com o
 * que estava preenchido se a pessoa desistir — o rascunho guardado aqui é o que
 * o FormBuilder recebe como `initialData` ao remontar (o Modal desmonta o corpo
 * ao fechar, então sem isso o formulário voltaria em branco).
 *
 * Vive fora das páginas porque as três telas que criam vínculo (cliente, fábrica
 * e perfil do vendedor) fazem exatamente esta mesma coreografia.
 */
interface Params {
  /** Abre/fecha o modal do formulário — quem controla o `open` da tela. */
  setFormOpen: (open: boolean) => void;
}

export function useTakeoverConfirmation({ setFormOpen }: Params) {
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  /** Mandou salvar num vínculo de outro vendedor: guarda, fecha o form, confirma. */
  const requestConfirmation = (data: Record<string, unknown>) => {
    setDraft(data);
    setFormOpen(false);
    setConfirmOpen(true);
  };

  /** Desistiu: a confirmação sai e o formulário volta como estava. */
  const cancelConfirmation = () => {
    setConfirmOpen(false);
    setFormOpen(true);
  };

  /** Acabou (salvou, ou o usuário fechou tudo): não sobra rascunho nem confirmação. */
  const reset = () => {
    setDraft(null);
    setConfirmOpen(false);
  };

  return {
    /** Dados do formulário guardados — devolva ao FormBuilder como `initialData`. */
    draft,
    confirmOpen,
    requestConfirmation,
    cancelConfirmation,
    reset,
  };
}
