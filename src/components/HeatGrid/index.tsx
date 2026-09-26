import { cn } from "@/lib/utils";
import React from "react";

/**
 * Intensidade de uma célula, do melhor ao pior. `empty` é "nada aconteceu",
 * não "pior" — sai cinza, fora da escala de cor.
 */
export type HeatLevel = "strong" | "good" | "weak" | "bad" | "empty";

const LEVEL: Record<HeatLevel, string> = {
  strong: "bg-(--green)/85 text-white",
  good: "bg-(--green)/45",
  weak: "bg-(--amber)/40",
  bad: "bg-(--red)/35",
  empty: "bg-(--bg3) text-(--muted)",
};

/**
 * Matriz de calor (turmas × meses, por exemplo): lê-se pelo formato da mancha,
 * não célula a célula. A largura segue o conteúdo — esticar para a tela
 * deformaria a mancha — e a grade rola na horizontal quando não cabe.
 */
const Root = ({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="overflow-x-auto">
    <table
      className={cn(
        "w-auto border-separate border-spacing-[3px] text-left",
        className
      )}
      {...props}
    />
  </div>
);

interface HeadCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** A coluna que dá nome às linhas: fica presa à esquerda ao rolar. */
  sticky?: boolean;
}

/** Cabeçalho de coluna, ou o rótulo da linha (`scope="row"`). */
const HeadCell = ({ sticky = false, className, ...props }: HeadCellProps) => (
  <th
    className={cn(
      "pr-8 text-left font-normal",
      sticky && "sticky left-0 bg-(--bg2)",
      className
    )}
    {...props}
  />
);

/** Célula comum, fora da escala (a contagem ao lado do rótulo da linha). */
const Cell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("pr-8", className)} {...props} />
);

interface HeatCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  level: HeatLevel;
  /**
   * Período ainda em andamento: apagada e tracejada, para a última diagonal
   * não se ler como queda.
   */
  partial?: boolean;
}

const HeatCell = ({ level, partial, className, ...props }: HeatCellProps) => (
  <td
    className={cn(
      "rounded-[4px] px-8 py-[6px] text-center",
      LEVEL[level],
      partial && "opacity-55 outline-1 outline-(--border) outline-dashed",
      className
    )}
    {...props}
  />
);

interface TileProps extends React.HTMLAttributes<HTMLDivElement> {
  level: HeatLevel;
}

/** Um valor solto na mesma escala da grade (o resumo acima dela). */
const Tile = ({ level, className, ...props }: TileProps) => (
  <div
    className={cn(
      "flex min-w-[76px] flex-col gap-[2px] rounded-[6px] px-12 py-8",
      LEVEL[level],
      className
    )}
    {...props}
  />
);

export const HeatGrid = { Root, HeadCell, Cell, HeatCell, Tile };
