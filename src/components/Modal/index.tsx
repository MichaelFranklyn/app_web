"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React from "react";

const ModalPortalContext = React.createContext<HTMLDivElement | null>(null);
export const useModalPortal = () => React.useContext(ModalPortalContext);

// ─── Root ────────────────────────────────────────────────────────────────────

const Root = Dialog.Root;

// ─── Trigger ─────────────────────────────────────────────────────────────────

const Trigger = Dialog.Trigger;

// ─── Header ──────────────────────────────────────────────────────────────────

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  showClose?: boolean;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ title, description, showClose = true, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-start justify-between gap-12 px-20 pt-20 pb-12",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <Dialog.Title asChild>
          <Title variant="heading-md" weight="semibold" as="h2">
            {title}
          </Title>
        </Dialog.Title>
        {description && (
          <Dialog.Description asChild>
            <Title variant="body" color="muted" as="p">
              {description}
            </Title>
          </Dialog.Description>
        )}
      </div>
      {showClose && (
        // Mesmo "Fechar" do Drawer: botão do DS (alvo de 33px, foco visível,
        // hover). Antes era um <svg> cru de 16px, sem área de toque, e o hover
        // pintava `--fg` — token que não existe.
        <Dialog.Close asChild>
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            isIconOnly
            label="Fechar"
            className="-mt-4 -mr-8 shrink-0"
          >
            <Button.Icon icon={X} />
          </Button.Root>
        </Dialog.Close>
      )}
    </div>
  )
);

Header.displayName = "Modal.Header";

// ─── Body ─────────────────────────────────────────────────────────────────────

const Body = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // `*:shrink-0`: o corpo rola. Quem usa `flex flex-col` aqui não pode ver os
    // filhos encolherem para caber — um card com overflow-hidden achatava e o
    // bloco de baixo cobria o botão dele.
    className={cn("flex-1 overflow-y-auto px-20 py-12 *:shrink-0", className)}
    {...props}
  />
));

Body.displayName = "Modal.Body";

// ─── Footer ──────────────────────────────────────────────────────────────────

const Footer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Mobile/tablet: botões empilhados e full-width (alvos de toque grandes).
      // Desktop: volta para linha, alinhados à direita, no tamanho natural.
      // gap-8: a escala é em px — o `gap-3` herdado do Tailwind dava 3px.
      "desktop:flex-row desktop:items-center desktop:justify-end desktop:[&>button]:w-auto flex flex-col gap-8 rounded-b-(--r-xl) border-t border-(--border) bg-(--bg) px-20 py-[14px] [&>button]:w-full",
      className
    )}
    {...props}
  />
));

Footer.displayName = "Modal.Footer";

// ─── Content (internal overlay + panel) ──────────────────────────────────────

interface ContentProps extends React.ComponentPropsWithoutRef<
  typeof Dialog.Content
> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

/** Painéis que um campo abre dentro do modal (lista do select, calendário). */
const OPEN_FIELD_PANELS = "[data-select-dropdown], [data-date-popup]";

const sizeVariants: Record<NonNullable<ContentProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
};

const Content = React.forwardRef<
  React.ComponentRef<typeof Dialog.Content>,
  ContentProps
>(({ className, size = "md", children, onEscapeKeyDown, ...props }, ref) => {
  const [portalEl, setPortalEl] = React.useState<HTMLDivElement | null>(null);

  // O Radix escuta o Escape no DOCUMENTO, em captura — antes de a tecla chegar
  // ao campo, então um `stopPropagation` no select não o alcança. Com uma
  // lista (ou calendário) aberta dentro do modal, o Escape é dela: fecha a
  // lista e o formulário fica. Sem lista aberta, fecha o modal como sempre.
  const handleEscapeKeyDown: typeof onEscapeKeyDown = (event) => {
    if (portalEl?.parentElement?.querySelector(OPEN_FIELD_PANELS)) {
      event.preventDefault();
    }
    onEscapeKeyDown?.(event);
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed inset-0 z-(--z-modal) bg-(--scrim) backdrop-blur-[3px]" />
      <Dialog.Content
        ref={ref}
        className={cn(
          "fixed top-1/2 left-1/2 z-(--z-modal) w-full -translate-x-1/2 -translate-y-1/2",
          "max-w-[calc(100vw-32px)]",
          "flex max-h-[90vh] flex-col",
          // Camada mais alta da tela: a sombra maior (--shadow-lg) a descola
          // do véu; a do card (--shadow-md) a deixava colada no fundo.
          "rounded-(--r-xl) border border-(--border) bg-(--bg2) shadow-(--shadow-lg)",
          "data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out",
          sizeVariants[size],
          className
        )}
        onEscapeKeyDown={handleEscapeKeyDown}
        {...props}
      >
        <ModalPortalContext.Provider value={portalEl}>
          {children}
        </ModalPortalContext.Provider>
        {/* Âncora de coordenadas: posicionada em (0,0) do Dialog.Content, tamanho zero, não bloqueia eventos */}
        <div ref={setPortalEl} className="absolute top-0 left-0" />
      </Dialog.Content>
    </Dialog.Portal>
  );
});

Content.displayName = "Modal.Content";

// ─── Export ───────────────────────────────────────────────────────────────────

export const Modal = Object.assign(Root, {
  Root,
  Trigger,
  Content,
  Header,
  Body,
  Footer,
  Close: Dialog.Close,
});
