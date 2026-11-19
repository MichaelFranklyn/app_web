import { cn } from "@/lib/utils";

/**
 * Duas versões da faixa de abas:
 * - `line` (padrão): traço âmbar sob a aba ativa, sobre a divisória.
 * - `filled`: trilha cinza com a aba ativa preenchida por completo na cor de
 *   ação (pedido do usuário, 18/11/2026). Serve onde as abas são a navegação
 *   principal da tela e precisam pesar mais que um traço.
 *
 * A lista escreve `data-variant` e é `group/tabs`; o item lê a versão pelo
 * grupo, então Tabs.Item, NavItem e FilterItem não precisam de prop própria.
 */
export type TabsVariant = "line" | "filled";

export const tabsStyles = {
  list: "group/tabs flex overflow-x-auto hide-scrollbar border-b border-(--border) mb-[24px]",
  listFilled: cn(
    // O halo de foco dentro de overflow-x-auto é cortado: a trilha tem p-[3px].
    // Compacta: na altura de um campo `sm` (~34px), não um bloco que pesa mais
    // que o cabeçalho ("muito grande", 18/11/2026).
    "w-fit max-w-full gap-2 p-[3px] rounded-(--radius-md)",
    "border-b-0 bg-(--bg4)"
  ),
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
    "data-[state=active]:text-(--color-action-text) data-[state=active]:font-medium data-[state=active]:after:scale-x-100",
    // Versão `filled`: sem traço; a aba ativa vira um bloco na cor de ação.
    "group-data-[variant=filled]/tabs:rounded-(--radius-sm) group-data-[variant=filled]/tabs:px-[12px] group-data-[variant=filled]/tabs:py-[4px]",
    "group-data-[variant=filled]/tabs:after:hidden group-data-[variant=filled]/tabs:transition-[background-color,color]",
    "group-data-[variant=filled]/tabs:data-[state=inactive]:hover:bg-(--bg2)",
    "group-data-[variant=filled]/tabs:data-[state=active]:bg-(--color-action) group-data-[variant=filled]/tabs:data-[state=active]:text-(--color-on-action)",
    "group-data-[variant=filled]/tabs:data-[state=active]:font-semibold group-data-[variant=filled]/tabs:data-[state=active]:shadow-(--shadow-xs)"
  ),
  content: "mt-2 focus-ring animate-fade-in",
};
