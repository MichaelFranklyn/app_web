"use client";

import { Button } from "@/components/Button";
import { X } from "lucide-react";
import React from "react";
import { useDrawer } from "../context";

/** Topo do painel: o conteúdo à esquerda e o "Fechar" sempre à direita. */
export function Header({ children }: { children: React.ReactNode }) {
  const drawer = useDrawer();

  return (
    <div className="flex items-start justify-between gap-8 border-b border-(--border) px-20 py-16">
      <div className="flex min-w-0 flex-col items-start">{children}</div>
      <Button.Root
        appearance="ghost"
        color="neutral"
        size="sm"
        isIconOnly
        label="Fechar"
        onClick={drawer?.onClose}
      >
        <Button.Icon icon={X} />
      </Button.Root>
    </div>
  );
}
