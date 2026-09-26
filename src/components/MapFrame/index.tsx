import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

/**
 * Moldura de mapa (rota do dia, radar, endereço do cliente). A altura vem de
 * quem usa; a moldura só garante borda, fundo enquanto o mapa carrega e que o
 * conteúdo não vaze pelos cantos.
 */
const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden rounded-(--r-lg) border border-(--border) bg-(--bg3)",
      className
    )}
    {...props}
  />
));
Root.displayName = "MapFrame.Root";

/** O mapa embutido do Google (`/maps/embed`). */
const Embed = ({ title, src }: { title: string; src: string }) => (
  <iframe
    title={title}
    src={src}
    className="h-full w-full"
    style={{ border: 0 }}
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    allowFullScreen
  />
);

interface MessageProps {
  icon?: LucideIcon;
  /** Véu sobre o mapa já desenhado (carregando), em vez de fundo vazio. */
  dim?: boolean;
  children: React.ReactNode;
}

/** O que aparece no lugar do mapa: carregando, erro ou falta de endereço. */
const Message = ({ icon: Icon, dim = false, children }: MessageProps) => (
  <div
    className={cn(
      "absolute inset-0 flex flex-col items-center justify-center gap-8 px-24 text-center",
      dim && "bg-(--bg3)/60"
    )}
  >
    {Icon ? (
      <Icon size={28} strokeWidth={1.5} className="text-(--muted2)" />
    ) : null}
    {typeof children === "string" ? (
      <Title variant="body-sm" color="muted">
        {children}
      </Title>
    ) : (
      children
    )}
  </div>
);

export const MapFrame = { Root, Embed, Message };
