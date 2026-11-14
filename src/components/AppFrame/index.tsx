"use client";

import { Button } from "@/components/Button";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import React from "react";
import { NavigationProgress } from "./NavigationProgress";

/**
 * Casca das telas com menu (sistema e console da plataforma).
 *
 * Sidebar e conteúdo colam na janela e um no outro: sem moldura, sem respiro
 * em volta. O que os separa é só o traço vertical da borda direita da
 * sidebar. No mobile a sidebar é drawer e o conteúdo usa a tela inteira.
 */
const Root = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen overflow-hidden bg-(--bg)">
    <SkipLink />
    {children}
  </div>
);

/** Destino do "Pular para o conteúdo": o `<main>` da casca. */
const MAIN_ID = "conteudo";

/**
 * Primeiro Tab da página: leva direto ao conteúdo, sem atravessar o menu
 * inteiro a cada tela (WCAG 2.4.1). Invisível até receber o foco.
 */
const SkipLink = () => (
  <a
    href={`#${MAIN_ID}`}
    className="focus-ring focus:text-body-sm sr-only focus:not-sr-only focus:fixed focus:top-8 focus:left-8 focus:z-[100] focus:rounded-(--r-md) focus:bg-(--bg2) focus:px-12 focus:py-8 focus:font-semibold focus:text-(--color-text) focus:shadow-(--shadow-sm)"
  >
    Pular para o conteúdo
  </a>
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
 * A sidebar na casca: drawer que desliza da esquerda no mobile e coluna fixa
 * no desktop.
 */
const FrameSidebar = ({
  drawerOpen,
  collapsed,
  children,
}: FrameSidebarProps) => (
  <Sidebar.Root
    className={cn(
      "z-[90] w-[232px] shrink-0",
      "fixed inset-y-0 left-0 transition-[transform,width] duration-200 ease-out",
      drawerOpen ? "translate-x-0" : "-translate-x-full",
      // `translate-none`, não `translate-x-0`: o `translate: 0` ainda cria
      // contexto de empilhamento, e aí o z-[95] do CollapseToggle só vale
      // DENTRO da sidebar; o Panel (que vem depois) cobria a metade do botão
      // que passa da borda (13/11/2026).
      "desktop:static desktop:z-auto desktop:translate-none",
      collapsed !== undefined &&
        (collapsed ? "desktop:w-[72px]" : "desktop:w-[232px]"),
      // Âncora do botão flutuante de recolher, na borda direita.
      "desktop:relative"
    )}
  >
    {children}
  </Sidebar.Root>
);

/** Recolher/expandir: botão flutuante sobre o traço que divide menu e conteúdo (desktop). */
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
      className="desktop:flex absolute top-[74px] right-0 z-[95] hidden size-24 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-(--border) bg-(--bg2) text-(--color-text-muted) shadow-(--shadow-sm) transition-colors hover:border-(--border2) hover:text-(--color-text)"
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
 * O conteúdo: ocupa o resto da janela, sem moldura. `min-w-0` para tabela
 * larga rolar dentro do `main` em vez de empurrar a casca.
 */
const Panel = ({ children }: { children: React.ReactNode }) => (
  <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-(--bg)">
    {/* Linha de carregamento ao trocar de tela: rente ao topo do conteúdo. */}
    <NavigationProgress />
    {children}
  </div>
);

/**
 * Hambúrguer da topbar: abre o drawer no mobile/tablet; some no desktop.
 * min-w/min-h 44px: alvo de toque (WCAG 2.5.8). Antes, o ghost sem padding com
 * margem negativa media 16×33px.
 * `-ml-[15px]`: o alvo é 44 e o ícone 14, centralizado — sem a compensação o
 * ícone ficava 15px à direita da margem do conteúdo (desalinhado do título).
 * A margem negativa devolve a folga ao gutter sem encolher a área de toque.
 */
const MenuButton = ({ onClick }: { onClick: () => void }) => (
  <Button.Root
    appearance="ghost"
    color="neutral"
    size="sm"
    isIconOnly
    label="Abrir menu"
    className="desktop:hidden mr-4 -ml-[15px] min-h-[44px] min-w-[44px] justify-center"
    onClick={onClick}
  >
    <Button.Icon icon={Menu} />
  </Button.Root>
);

/**
 * `tabIndex={-1}` deixa o pulo do SkipLink mover o foco para cá (e o próximo
 * Tab segue dentro do conteúdo). Sem contorno: quem recebe o foco é a área
 * inteira, não um controle.
 */
const Main = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <main
    id={MAIN_ID}
    tabIndex={-1}
    className={cn("flex-1 overflow-y-auto outline-none", className)}
    {...props}
  />
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
