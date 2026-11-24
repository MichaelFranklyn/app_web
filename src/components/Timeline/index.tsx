import { cn } from "@/lib/utils";
import React from "react";

/**
 * Sequência de acontecimentos, cada um com um traço à esquerda: histórico de
 * um chamado, atividade e auditoria de uma empresa.
 */
const Root = ({
  className,
  ...props
}: React.OlHTMLAttributes<HTMLOListElement>) => (
  <ol className={cn("flex flex-col gap-12", className)} {...props} />
);

const Item = ({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li
    className={cn(
      // O ponto marca onde cada acontecimento começa; o traço os liga.
      "relative flex flex-col gap-2 border-l-2 border-(--border) pl-12",
      "before:absolute before:top-[7px] before:-left-[5px] before:size-[8px] before:rounded-full before:bg-(--border2)",
      className
    )}
    {...props}
  />
);

export const Timeline = { Root, Item };
