"use client";

import { cn } from "@/lib/utils";
import React, { createContext, useContext } from "react";
import { tabsStyles, TabsVariant } from "../List/style";
import { useScrollEdges } from "@/hooks/useScrollEdges";

/**
 * Faixa com CARA de abas que só FILTRA o conteúdo abaixo — não troca de painel.
 *
 * Por que não `Tabs.Root` + `Tabs.Item`: a aba do Radix declara
 * `aria-controls` apontando para o `Tabs.Content` dela. Sem painel, o id não
 * existe e o leitor de tela anuncia uma aba que controla nada (axe:
 * `aria-valid-attr-value`, critical, em /commissions — auditoria 13/11/2026,
 * P-14.3). Aqui são botões com `aria-pressed` num `role="group"` nomeado: o
 * leitor diz "Recebido, botão, pressionado", que é o que acontece de fato.
 *
 * Use `Tabs.Root` quando houver `Tabs.Content`; `Tabs.NavList` quando cada aba
 * for uma rota; este, quando a faixa só filtra a mesma lista.
 */
interface FilterContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

type FilterProps = Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> &
  FilterContextValue & {
    /** Nome do grupo para o leitor de tela ("Situação da comissão"). */
    "aria-label": string;
    variant?: TabsVariant;
  };

export const Filter = React.forwardRef<HTMLDivElement, FilterProps>(
  ({ value, onValueChange, className, variant = "line", ...props }, ref) => {
    // O mesmo esmaecido de borda do `NavList`: sem ele, a última opção saía
    // cortada no celular sem pista de que a faixa rolava (/enviados do
    // portal, 24/11/2026).
    const edgesRef = useScrollEdges(ref);
    return (
      <FilterContext.Provider value={{ value, onValueChange }}>
        <div
          ref={edgesRef}
          role="group"
          data-variant={variant}
          className={cn(
            tabsStyles.list,
            tabsStyles.listEdgeFade,
            variant === "filled" && tabsStyles.listFilled,
            className
          )}
          {...props}
        />
      </FilterContext.Provider>
    );
  }
);
Filter.displayName = "Tabs.Filter";

type FilterItemProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "type"
> & { value: string };

export const FilterItem = React.forwardRef<HTMLButtonElement, FilterItemProps>(
  ({ value, className, onClick, ...props }, ref) => {
    const ctx = useContext(FilterContext);
    if (!ctx) throw new Error("Tabs.FilterItem precisa estar em Tabs.Filter");
    const active = ctx.value === value;
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        // data-state reaproveita o destaque das abas (mesmo estilo visual).
        data-state={active ? "active" : "inactive"}
        className={cn(tabsStyles.item, className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !active) ctx.onValueChange(value);
        }}
        {...props}
      />
    );
  }
);
FilterItem.displayName = "Tabs.FilterItem";
