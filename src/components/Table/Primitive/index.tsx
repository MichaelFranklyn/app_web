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
  /**
   * Com `cards`, mostra a faixa "Ordenar por:" acima dos cartões (padrão).
   * Desligue em lista curta: com dois ou três cartões, que cabem inteiros na
   * tela, a faixa de chips pesava mais que a própria lista (crítica do detalhe
   * do pedido, 23/11/2026). No desktop o cabeçalho fica, sempre.
   */
  cardSort?: boolean;
}

export const Primitive = React.forwardRef<
  HTMLTableElement,
  TablePrimitiveProps
>(({ className, maxHeight, cards = false, cardSort = true, ...props }, ref) => (
  <div
    data-table-cards={cards || undefined}
    data-card-sort={cards && !cardSort ? "off" : undefined}
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
