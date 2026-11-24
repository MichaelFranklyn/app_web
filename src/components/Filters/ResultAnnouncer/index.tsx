"use client";

import { useEffect, useState } from "react";

import { plural } from "@/utils/format/plural";

interface ResultAnnouncerProps {
  /** Total de linhas que o filtro deixou; `undefined` enquanto carrega. */
  count?: number;
}

const describe = (count: number) =>
  count === 0 ? "Nenhum resultado" : plural(count, "resultado", "resultados");

/**
 * Região viva (invisível) que conta ao leitor de tela quantas linhas o filtro
 * deixou (WCAG 4.1.3). Quem enxerga vê a tabela mudar; quem não enxerga só
 * sabe que algo aconteceu se alguém disser.
 *
 * Enquanto carrega (`count` indefinido) mantém o último número: esvaziar e
 * reescrever faria o leitor repetir o mesmo total a cada consulta. O texto que
 * já está lá na montagem não é lido — só a mudança, que é o que interessa.
 */
export function ResultAnnouncer({ count }: ResultAnnouncerProps) {
  const [text, setText] = useState(() =>
    count === undefined ? "" : describe(count)
  );

  useEffect(() => {
    if (count !== undefined) setText(describe(count));
  }, [count]);

  return (
    <span role="status" aria-live="polite" className="sr-only">
      {text}
    </span>
  );
}
