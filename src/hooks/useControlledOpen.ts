"use client";

import { useState } from "react";

/**
 * Abertura de um modal que serve aos dois jeitos de abrir.
 *
 * Sem `open`, o modal guarda o próprio estado e desenha o seu botão (gatilho).
 * Com `open`, quem manda é o pai: o modal é aberto de fora (um item do "Mais
 * ações", por exemplo) e não desenha botão nenhum, porque o gatilho já existe
 * em outro lugar. `isControlled` diz qual dos dois está valendo.
 */
export function useControlledOpen(
  open?: boolean,
  onOpenChange?: (open: boolean) => void
) {
  const [innerOpen, setInnerOpen] = useState(false);
  const isControlled = open !== undefined;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInnerOpen(next);
    onOpenChange?.(next);
  };

  return { open: isControlled ? open : innerOpen, setOpen, isControlled };
}
