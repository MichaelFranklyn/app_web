import { cn } from "@/lib/utils";

export const sidebarRootStyles = {
  root: cn(
    // Colada na lateral da janela, sem moldura: o único limite é o traço à
    // direita, que separa o menu do conteúdo (e é onde o botão de recolher se
    // apoia).
    "bg-(--bg2) border-r border-(--border) h-full",
    "flex flex-col"
  ),
};
