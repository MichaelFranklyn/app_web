import { cn } from "@/lib/utils";
import React from "react";

interface SelectableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Escolhida: fundo âmbar claro, que fica enquanto ela estiver marcada. */
  selected?: boolean;
}

/**
 * Linha de uma lista de ESCOLHA (marcar clientes para a semana): fundo âmbar
 * claro e barra âmbar quando escolhida, cinza leve no hover quando não. A caixinha e o
 * conteúdo vêm de fora; a linha só dá o respiro e o estado.
 */
export function SelectableRow({
  selected = false,
  className,
  ...props
}: SelectableRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-8 px-16 py-12 transition-[background-color,box-shadow] duration-150",
        // Barra de 3px à esquerda, como a linha clicável da tabela: o âmbar
        // claro sozinho some em tela com brilho baixo.
        selected
          ? "bg-(--amber-bg) shadow-[inset_3px_0_0_var(--amber)]"
          : "hover:bg-(--bg3)",
        className
      )}
      {...props}
    />
  );
}

/**
 * A área clicável da linha: um `<label>` do checkbox que cobre o nome e as
 * linhas de apoio. A caixinha sozinha é pequena para quem tem a mão menos
 * firme, e o nome é onde o olho está.
 */
function Target({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "flex min-w-0 flex-1 cursor-pointer flex-col gap-4",
        className
      )}
      {...props}
    />
  );
}

SelectableRow.Target = Target;
