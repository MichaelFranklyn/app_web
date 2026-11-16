import { cn } from "@/lib/utils";

export const tabsStyles = {
  list: "flex overflow-x-auto hide-scrollbar border-b border-(--border) mb-[24px]",
  item: cn(
    "shrink-0 whitespace-nowrap",
    "relative px-[18px] py-[10px] text-body-sm text-(--color-text-muted)",
    "cursor-pointer transition-colors duration-150 focus-ring",
    "hover:text-(--color-text)",
    // Traço da aba num ::after (não border-b): cresce do centro ao ativar, e no
    // hover de uma aba inativa aparece cinza, antecipando o clique. Vale para
    // Tabs.Item (Radix), NavItem e FilterItem: os três escrevem data-state.
    "after:absolute after:inset-x-0 after:bottom-[-1px] after:h-[2px] after:rounded-full after:bg-(--amber)",
    "after:origin-center after:scale-x-0 after:transition-transform after:duration-200 after:ease-(--ease-out-soft)",
    "data-[state=inactive]:hover:after:scale-x-100 data-[state=inactive]:hover:after:bg-(--border2)",
    "data-[state=active]:text-(--color-action-text) data-[state=active]:font-medium data-[state=active]:after:scale-x-100"
  ),
  content: "mt-2 focus-ring animate-fade-in",
};
