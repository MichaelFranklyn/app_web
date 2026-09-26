"use client";

import { Button } from "@/components/Button";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import React from "react";

/**
 * Casca das telas com menu (sistema e console da plataforma).
 *
 * A casca respira: no desktop um padding na página deixa as bordas da sidebar
 * e do painel de conteúdo aparecerem, em vez de as duas colarem na janela. No
 * mobile a sidebar é drawer e o conteúdo usa a tela inteira.
 */
const Root = ({ children }: { children: React.ReactNode }) => (
  <div className="desktop:gap-16 desktop:p-12 flex h-screen overflow-hidden bg-(--bg3)">
    {children}
  </div>
);

/** Véu atrás do drawer aberto (mobile/tablet); tocar fora fecha. */
const Backdrop = ({
  open,
  onClose,
  "data-testid": testId,
}: {
  open: boolean;
  onClose: () => void;
  "data-testid"?: string;
}) =>
  open ? (
    <div
      data-testid={testId}
      className="desktop:hidden fixed inset-0 z-[80] bg-black/40"
      onClick={onClose}
      aria-hidden
    />
  ) : null;

interface FrameSidebarProps {
  drawerOpen: boolean;
  /** Recolhida no desktop. Sem a prop, a sidebar não recolhe. */
  collapsed?: boolean;
  children: React.ReactNode;
}

/**
 * A sidebar na casca: drawer que desliza da esquerda no mobile (colado na
 * janela, sem cantos) e coluna fixa no desktop.
 */
const FrameSidebar = ({
  drawerOpen,
  collapsed,
  children,
}: FrameSidebarProps) => (
  <Sidebar.Root
    className={cn(
      "z-[90] w-[232px] shrink-0",
      "fixed inset-y-0 left-0 rounded-none transition-[transform,width] duration-200 ease-out",
      "desktop:rounded-(--radius-lg)",
      drawerOpen ? "translate-x-0" : "-translate-x-full",
      "desktop:static desktop:z-auto desktop:translate-x-0",
      collapsed !== undefined &&
        (collapsed ? "desktop:w-[72px]" : "desktop:w-[232px]"),
      // Âncora do botão flutuante de recolher, na borda direita.
      "desktop:relative"
    )}
  >
    {children}
  </Sidebar.Root>
);

/** Recolher/expandir: botão flutuante na borda direita da sidebar (desktop). */
const CollapseToggle = ({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) => {
  const label = collapsed ? "Expandir menu" : "Recolher menu";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="desktop:flex absolute top-[74px] right-0 z-[95] hidden size-24 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-(--border) bg-(--bg2) text-(--muted) shadow-(--shadow-sm) transition-colors hover:border-(--border2) hover:text-(--text)"
    >
      {collapsed ? (
        <ChevronRight size={14} strokeWidth={2.5} />
      ) : (
        <ChevronLeft size={14} strokeWidth={2.5} />
      )}
    </button>
  );
};

/**
 * O painel do conteúdo: mesma borda e mesmo raio da sidebar. `overflow-hidden`
 * para a topbar e o `main` não vazarem por cima dos cantos arredondados.
 */
const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="desktop:rounded-(--radius-lg) desktop:border desktop:border-(--border) flex flex-1 flex-col overflow-hidden bg-(--bg)">
    {children}
  </div>
);

/** Hambúrguer da topbar: abre o drawer no mobile/tablet; some no desktop. */
const MenuButton = ({ onClick }: { onClick: () => void }) => (
  <Button.Root
    appearance="ghost"
    color="neutral"
    size="sm"
    isIconOnly
    label="Abrir menu"
    className="desktop:hidden mr-4 -ml-4"
    onClick={onClick}
  >
    <Button.Icon icon={Menu} />
  </Button.Root>
);

const Main = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <main className={cn("flex-1 overflow-y-auto", className)} {...props} />
);

export const AppFrame = {
  Root,
  Backdrop,
  Sidebar: FrameSidebar,
  CollapseToggle,
  Panel,
  MenuButton,
  Main,
};
