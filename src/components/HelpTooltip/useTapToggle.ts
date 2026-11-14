"use client";

import React from "react";

/**
 * Faz a ajuda abrir no TOQUE, não só no hover.
 *
 * O Tooltip do Radix ignora ponteiro de toque (`pointerType === "touch"`) e
 * fecha no clique: no celular o "?" não abria nunca. Aqui o tooltip vira
 * controlado: o hover e o foco continuam abrindo pelo Radix (`onOpenChange`),
 * e o toque/clique alterna. O `preventDefault` nos dois eventos desliga o
 * fechamento interno do gatilho; tocar fora ou Esc fecham pelo próprio Radix.
 *
 * O estado é lido no `pointerdown` porque, no desktop, o hover já abriu antes
 * do clique: alternar com base no estado do clique fecharia e reabriria.
 */
export function useTapToggle() {
  const [open, setOpen] = React.useState(false);
  const openAtPress = React.useRef<boolean | null>(null);

  const triggerProps = {
    onPointerDown: (event: React.PointerEvent) => {
      openAtPress.current = open;
      event.preventDefault();
    },
    onClick: (event: React.MouseEvent) => {
      event.preventDefault();
      const wasOpen = openAtPress.current ?? open;
      openAtPress.current = null;
      setOpen(!wasOpen);
    },
  };

  return { open, onOpenChange: setOpen, triggerProps };
}
