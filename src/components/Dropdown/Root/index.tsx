"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import React, { useEffect, useState } from "react";

type RootProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Root
>;

/**
 * O Root do Radix, com um ajuste: arrastar o dedo FORA do menu fecha.
 *
 * No toque, o Radix só dispensa o menu no clique de fora — quem rolava a tela
 * com o menu aberto o via ficar parado sobre o conteúdo (relato de
 * 19/11/2026, /commissions no celular). Arrastar dentro do menu (painel de
 * notificações com lista longa) não conta. Aceita o modo controlado
 * (`open`/`onOpenChange`) e o livre, como o original.
 */
export function Root({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: RootProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  };

  // A referência estável do callback não importa aqui: o efeito religa a cada
  // abertura, e fecha com o valor corrente.
  const close = React.useRef(setOpen);
  close.current = setOpen;

  useEffect(() => {
    if (!open) return;
    const handleTouchMove = (event: TouchEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[role=menu]")) return;
      close.current(false);
    };
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => document.removeEventListener("touchmove", handleTouchMove);
  }, [open]);

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
  );
}
