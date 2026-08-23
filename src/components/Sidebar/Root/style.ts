import { cn } from "@/lib/utils";

export const sidebarRootStyles = {
  root: cn(
    // A moldura: a sidebar é um painel próprio, cercado por borda, e não uma
    // faixa colada na lateral da janela. `h-full` (e não `h-screen`) porque a
    // casca respira num padding — a altura é a do espaço interno dela.
    "bg-(--bg2) border border-(--border) rounded-(--radius-lg) h-full",
    "flex flex-col"
  ),
};
