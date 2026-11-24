import { cn } from "@/lib/utils";

export const topbarRootStyles = {
  root: cn(
    "sticky top-0 z-(--z-sticky) flex h-[52px] w-full shrink-0 items-center justify-between gap-12",
    // Separação leve: traço a meia força e fundo translúcido com desfoque,
    // o conteúdo que rola por baixo some sem a barra virar um bloco pesado.
    "border-b border-(--border)/60 bg-(--bg)/85 backdrop-blur-md px-16 tablet:px-24"
  ),
};
