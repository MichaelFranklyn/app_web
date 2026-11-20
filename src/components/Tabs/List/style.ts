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
  // A divisória é uma sombra interna, não border-b: com `overflow-x-auto` o
  // `overflow-y` vira auto também, e o traço da aba (que ficava em -1px, sobre
  // a borda) vazava 1px para baixo — no celular a faixa inteira "balançava" na
  // vertical ao arrastar (relato de 19/11/2026, /commissions). Agora o traço
  // fica dentro da caixa e a sombra é pintada por baixo dele.
  list: cn(
    "group/tabs flex overflow-x-auto overflow-y-hidden overscroll-x-contain hide-scrollbar mb-[24px]",
    "shadow-[inset_0_-1px_0_var(--border)]"
  ),
  listFilled: cn(
    // O halo de foco dentro de overflow-x-auto é cortado: a trilha tem p-[3px].
    // Compacta: na altura de um campo `sm` (~34px), não um bloco que pesa mais
    // que o cabeçalho ("muito grande", 18/11/2026).
    // Abaixo do desktop a trilha ocupa a linha e as abas dividem o espaço em
    // partes iguais (pedido de 19/11/2026, Prioridades no celular): um bloco
    // curto à esquerda parecia sobra. No desktop volta a ser do tamanho dela.
    "w-full desktop:w-fit max-w-full gap-2 p-[3px] rounded-(--radius-md)",
    "shadow-none bg-(--bg4)"
  ),
  item: cn(
    "shrink-0 whitespace-nowrap",
    "relative px-[18px] py-[10px] text-body-sm text-(--color-text-muted)",
    "cursor-pointer transition-colors duration-150 focus-ring",
    "hover:text-(--color-text)",
    // Traço da aba num ::after (não border-b): cresce do centro ao ativar, e no
    // hover de uma aba inativa aparece cinza, antecipando o clique. Vale para
    // Tabs.Item (Radix), NavItem e FilterItem: os três escrevem data-state.
    "after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-(--amber)",
    "after:origin-center after:scale-x-0 after:transition-transform after:duration-200 after:ease-(--ease-out-soft)",
    "data-[state=inactive]:hover:after:scale-x-100 data-[state=inactive]:hover:after:bg-(--border2)",
    "data-[state=active]:text-(--color-action-text) data-[state=active]:font-medium data-[state=active]:after:scale-x-100",
    // Versão `filled`: sem traço; a aba ativa vira um bloco na cor de ação.
    "group-data-[variant=filled]/tabs:rounded-(--radius-sm) group-data-[variant=filled]/tabs:px-[12px] group-data-[variant=filled]/tabs:py-[4px]",
    "max-desktop:group-data-[variant=filled]/tabs:flex-1 max-desktop:group-data-[variant=filled]/tabs:text-center",
    "group-data-[variant=filled]/tabs:after:hidden group-data-[variant=filled]/tabs:transition-[background-color,color]",
    "group-data-[variant=filled]/tabs:data-[state=inactive]:hover:bg-(--bg2)",
    "group-data-[variant=filled]/tabs:data-[state=active]:bg-(--color-action) group-data-[variant=filled]/tabs:data-[state=active]:text-(--color-on-action)",
    "group-data-[variant=filled]/tabs:data-[state=active]:font-semibold group-data-[variant=filled]/tabs:data-[state=active]:shadow-(--shadow-xs)"
  ),
  content: "mt-2 focus-ring animate-fade-in",
};
