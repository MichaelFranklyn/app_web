import React from "react";
import { cn } from "@/lib/utils";
import { tableCardsStyle } from "./cards";
import { tablePrimitiveStyles } from "./style";

interface TablePrimitiveProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Limita a altura da lista e ativa scroll vertical; o cabeçalho fica fixo. */
  maxHeight?: number | string;
  /**
   * Abaixo de 1024px cada linha vira um cartão (identidade, valor e situação à
   * vista; o resto como detalhe rotulado) em vez de a tabela rolar para o lado.
   * O lugar de cada célula no cartão vem de `card` em `Table.Cell` — ver
   * `./cards.ts`. No desktop nada muda.
   */
  cards?: boolean;
}

export const Primitive = React.forwardRef<
  HTMLTableElement,
  TablePrimitiveProps
>(({ className, maxHeight, cards = false, ...props }, ref) => (
  <div
    data-table-cards={cards || undefined}
    className={cn(
      tablePrimitiveStyles.wrapper,
      maxHeight != null &&
        (cards
          ? tablePrimitiveStyles.scrollDesktopOnly
          : tablePrimitiveStyles.scroll),
      cards && tableCardsStyle
    )}
    // A altura vai numa variável: em modo cartão o teto só vale no desktop.
    // No celular a lista de cartões rolava DENTRO da página (um scroll dentro
    // do outro, o dedo prendia na lista) — lá a página inteira é que rola.
    style={
      maxHeight != null
        ? ({
            "--table-max-h":
              typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
          } as React.CSSProperties)
        : undefined
    }
  >
    <table
      ref={ref}
      className={cn(tablePrimitiveStyles.table, className)}
      {...props}
    />
  </div>
));

Primitive.displayName = "Table.Table";
