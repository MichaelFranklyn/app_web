"use client";

import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
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
        "flex items-start justify-between gap-4 border-b border-(--border) px-16 py-12",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-6">
        <Dialog.Title className="text-heading-md font-semibold text-(--fg)">
          {title}
        </Dialog.Title>
        {description && (
          <Dialog.Description className="text-md text-(--muted)">
            {description}
          </Dialog.Description>
        )}
      </div>
      {showClose && (
        <Dialog.Close className="mt-2 shrink-0 text-(--muted) transition-colors hover:text-(--fg)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
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
    className={cn("flex-1 overflow-y-auto px-16 py-12", className)}
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
      "desktop:flex-row desktop:items-center desktop:justify-end desktop:[&>button]:w-auto flex flex-col gap-3 border-t border-(--border) px-16 py-12 [&>button]:w-full",
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
>(({ className, size = "md", children, ...props }, ref) => {
  const [portalEl, setPortalEl] = React.useState<HTMLDivElement | null>(null);

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] duration-200" />
      <Dialog.Content
        ref={ref}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
          "max-w-[calc(100vw-32px)]",
          "flex max-h-[90vh] flex-col",
          "rounded-(--r-lg) border border-(--border) bg-(--bg2) shadow-(--shadow-md)",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in data-[state=closed]:fade-out",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          "duration-200",
          sizeVariants[size],
          className
        )}
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
