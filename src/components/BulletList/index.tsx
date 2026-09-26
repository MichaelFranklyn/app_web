import { cn } from "@/lib/utils";
import React from "react";

/**
 * Lista com marcador, para enumerar dentro de um texto (as linhas que a
 * importação não conseguiu ler, por exemplo). Herda cor e tamanho do texto
 * em volta — dentro de um `Alert`, sai na cor do aviso.
 */
const Root = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul
    className={cn("flex list-disc flex-col gap-2 pl-16", className)}
    {...props}
  />
);

const Item = (props: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li {...props} />
);

export const BulletList = { Root, Item };
