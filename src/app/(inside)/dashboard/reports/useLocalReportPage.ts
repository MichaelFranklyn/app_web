"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * Paginação em memória para os relatórios que chegam INTEIROS do backend.
 *
 * Vários papéis daqui não são listas paginadas no servidor: a positivação, a
 * carteira, a curva ABC e as fábricas vêm de uma consulta só, porque esconder
 * linha num documento de conferência é esconder justamente o que se foi
 * procurar (quem não comprou, quem sumiu, a cauda da curva). Com o conjunto
 * todo na mão, paginar é fatiar um array — e trocar de página não custa rede.
 *
 * A página mora na URL, como o resto do recorte (ver `useReportFilters`): o
 * botão "voltar" desfaz o clique e o link abre a mesma página do outro lado.
 * `push` fica exposto porque cada aba tem os próprios parâmetros de recorte
 * local (o escopo da positivação, a classe da curva ABC) e todos precisam
 * zerar a página junto — trocar de recorte e cair na página 4 de uma lista que
 * encolheu mostra tabela vazia.
 */
export const useLocalReportPage = <T>(rows: T[], perPage: number) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const push = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      const query = params.toString();
      // `replace`, e não `push`: paginar não é navegar. Empilhar cada página no
      // histórico faria o "voltar" percorrer de volta a tabela inteira antes de
      // sair da tela.
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const setCurrentPage = useCallback(
    // Página 1 é o default: mantê-la fora da URL deixa o link limpo.
    (page: number) => push({ page: page <= 1 ? null : String(page) }),
    [push]
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));

  // A página pedida pode não existir mais (o filtro encolheu a lista): mostrar
  // a última é melhor do que uma tabela vazia com paginação acesa.
  const safePage = Math.min(currentPage, totalPages);

  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * perPage, safePage * perPage),
    [rows, safePage, perPage]
  );

  return {
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    pageRows,
    push,
  };
};
