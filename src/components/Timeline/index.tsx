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
      "flex flex-col gap-[2px] border-l-2 border-(--border) pl-12",
      className
    )}
    {...props}
  />
);

export const Timeline = { Root, Item };
