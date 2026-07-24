import { cn } from "@/lib/utils";

export const topbarBreadcrumbStyles = {
  // `min-w-0` permite que ESTE lado ceda espaço primeiro: sem isso, um item
  // longo à direita (o nome da empresa) seria espremido em vez do rótulo da
  // página, que é curto e se recompõe a cada rota.
  root: cn(
    "flex min-w-0 flex-1 items-center gap-[6px] text-[13px] text-(--muted)"
  ),
  current: "text-(--text) font-(--weight-semibold)",
  separator: "select-none text-(--muted)",
};
