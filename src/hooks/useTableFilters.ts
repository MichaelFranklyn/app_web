"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export interface TextFieldConfig {
  type: "text";
  queryField: string;
  operator?: string;
  debounce?: number;
}

export interface SelectFieldConfig {
  type: "select";
  queryField: string;
  operator?: string;
  /**
   * Outros valores gravados que significam a MESMA escolha da tela.
   *
   * Existe para coluna cujo vocabulário mudou depois que já havia registro
   * salvo: a prioridade do vínculo, por exemplo, hoje é "alta"/"media"/"baixa",
   * mas as linhas antigas guardam "high"/"medium"/"low". Filtrando no banco por
   * um valor só, esses registros somem da lista — e some sem avisar, que é o
   * pior jeito de sumir.
   *
   * Com o mapa preenchido, a escolha vira um `in` com todas as grafias.
   */
  aliases?: Record<string, string[]>;
}

export type FieldConfig = TextFieldConfig | SelectFieldConfig;

export interface UseTableFiltersReturn {
  inputValues: Record<string, string>;
  queryValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  /** Aplica várias chaves de uma vez (ver a nota sobre a URL na implementação). */
  setFilters: (patch: Record<string, string | undefined>) => void;
  /**
   * Escreve na URL parâmetros que NÃO são filtro (hoje, a ordenação): eles não
   * viram condição de busca, não aparecem no painel de filtros e sobrevivem a
   * um "limpar filtros" — quem ordenou por valor continua ordenado por valor
   * depois de limpar a busca.
   */
  setParams: (patch: Record<string, string | undefined>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
}

function applyPatch(
  current: Record<string, string>,
  patch: Record<string, string | undefined>
): Record<string, string> {
  const next = { ...current };
  Object.entries(patch).forEach(([key, value]) => {
    if (value) next[key] = value;
    else delete next[key];
  });
  return next;
}

function omitKey(
  obj: Record<string, string>,
  key: string
): Record<string, string> {
  const next = { ...obj };
  delete next[key];
  return next;
}

export const useTableFilters = (
  fields: Record<string, FieldConfig>
): UseTableFiltersReturn => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const textDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingFilterRef = useRef<{
    key: string;
    value: string | undefined;
  } | null>(null);
  // O que o usuário já digitou mas ainda não venceu o debounce. `setFilters`
  // cancela o timer, então sem guardar isto aqui o texto sumiria da consulta e
  // da URL enquanto continuasse aparecendo no campo — quem digita a busca e
  // escolhe um filtro no mesmo painel, antes dos 300ms, cairia nisso.
  const pendingTextRef = useRef<{
    key: string;
    value: string | undefined;
  } | null>(null);
  const clearingRef = useRef(false);

  const getFiltersFromUrl = useCallback(
    (sp: ReturnType<typeof useSearchParams>): Record<string, string> => {
      const result: Record<string, string> = {};
      sp.forEach((value, key) => {
        if (key in fields) result[key] = value;
      });
      return result;
    },
    [fields]
  );

  const [inputValues, setInputValues] = useState<Record<string, string>>(() =>
    getFiltersFromUrl(searchParams)
  );
  const [queryValues, setQueryValues] = useState<Record<string, string>>(() =>
    getFiltersFromUrl(searchParams)
  );

  useEffect(() => {
    if (textDebounceRef.current !== null) return;

    if (pendingFilterRef.current !== null) {
      const { key, value } = pendingFilterRef.current;
      const committed = value
        ? searchParams.get(key) === value
        : !searchParams.has(key);
      if (!committed) return;
      pendingFilterRef.current = null;
    }

    if (clearingRef.current) {
      const hasAnyField = Object.keys(fields).some((k) => searchParams.has(k));
      if (hasAnyField) return;
      clearingRef.current = false;
    }

    const fromUrl = getFiltersFromUrl(searchParams);
    setInputValues((prev) =>
      JSON.stringify(prev) !== JSON.stringify(fromUrl) ? fromUrl : prev
    );
    setQueryValues((prev) =>
      JSON.stringify(prev) !== JSON.stringify(fromUrl) ? fromUrl : prev
    );
  }, [searchParams, getFiltersFromUrl, fields]);

  useEffect(() => {
    return () => {
      if (textDebounceRef.current) clearTimeout(textDebounceRef.current);
    };
  }, []);

  /**
   * Escreve o estado da lista na URL SEM passar pelo roteador.
   *
   * `router.replace` trata a troca de filtro como navegação: o Next volta ao
   * servidor buscar o payload da rota, e numa lista com dados no SSR isso
   * significa refazer as consultas da página inteira a cada tecla digitada,
   * cada página virada e cada coluna ordenada — trabalho que ninguém vê, já que
   * quem repinta a tabela é o Apollo, no cliente. Era o custo por interação que
   * o Speed Insights media na carteira de clientes.
   *
   * A History API nativa é integrada ao roteador do Next (`usePathname` e
   * `useSearchParams` continuam refletindo a URL), então o link permanece
   * compartilhável e o F5 continua abrindo o mesmo recorte — só não há mais ida
   * ao servidor. `replaceState`, e não `pushState`: filtrar não é um passo do
   * histórico, o "voltar" tem de sair da lista.
   */
  const writeUrl = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        query ? `${pathname}?${query}` : pathname
      );
    },
    [pathname]
  );

  const updateUrl = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      writeUrl(params);
    },
    [searchParams, writeUrl]
  );

  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      const config = fields[key];

      setInputValues((prev) =>
        value ? { ...prev, [key]: value } : omitKey(prev, key)
      );

      const delay = config?.type === "text" ? (config.debounce ?? 300) : 0;

      if (delay > 0) {
        if (textDebounceRef.current) clearTimeout(textDebounceRef.current);
        pendingTextRef.current = { key, value };
        textDebounceRef.current = setTimeout(() => {
          textDebounceRef.current = null;
          pendingTextRef.current = null;
          pendingFilterRef.current = { key, value };
          setQueryValues((prev) =>
            value ? { ...prev, [key]: value } : omitKey(prev, key)
          );
          updateUrl(key, value);
        }, delay);
      } else {
        setQueryValues((prev) =>
          value ? { ...prev, [key]: value } : omitKey(prev, key)
        );
        updateUrl(key, value);
      }
    },
    [fields, updateUrl]
  );

  /**
   * Escreve várias chaves numa tacada só, sempre voltando para a página 1.
   *
   * Chamar `setFilter` duas vezes no mesmo evento NÃO funciona: as duas montam
   * a URL a partir do mesmo `searchParams` deste render, então a segunda
   * sobrescreve a primeira (um filtro de período gravaria só o "até"). Aqui as
   * chaves entram no mesmo `URLSearchParams` e numa única escrita da URL.
   *
   * `filterPatch` vai para o estado dos filtros E para a URL; `urlPatch` só
   * para a URL. É essa separação que deixa a ordenação viajar pela URL sem
   * virar condição de busca.
   */
  const commit = useCallback(
    (
      filterPatch: Record<string, string | undefined>,
      urlPatch: Record<string, string | undefined>
    ) => {
      if (textDebounceRef.current) {
        clearTimeout(textDebounceRef.current);
        textDebounceRef.current = null;
      }
      pendingFilterRef.current = null;

      // O texto pendente entra JUNTO, e antes: quem está aplicando o patch tem
      // a última palavra se mexer na mesma chave.
      const pendingText = pendingTextRef.current;
      pendingTextRef.current = null;
      const patch =
        pendingText && !(pendingText.key in filterPatch)
          ? { [pendingText.key]: pendingText.value, ...filterPatch }
          : filterPatch;

      if (Object.keys(patch).length > 0) {
        setInputValues((prev) => applyPatch(prev, patch));
        setQueryValues((prev) => applyPatch(prev, patch));
      }

      const params = new URLSearchParams(searchParams.toString());
      Object.entries({ ...patch, ...urlPatch }).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      writeUrl(params);
    },
    [searchParams, writeUrl]
  );

  const setFilters = useCallback(
    (patch: Record<string, string | undefined>) => commit(patch, {}),
    [commit]
  );

  const setParams = useCallback(
    (patch: Record<string, string | undefined>) => commit({}, patch),
    [commit]
  );

  const clearFilters = useCallback(() => {
    if (textDebounceRef.current) {
      clearTimeout(textDebounceRef.current);
      textDebounceRef.current = null;
    }
    pendingFilterRef.current = null;
    pendingTextRef.current = null;
    clearingRef.current = true;
    setInputValues({});
    setQueryValues({});
    const params = new URLSearchParams(searchParams.toString());
    Object.keys(fields).forEach((key) => params.delete(key));
    params.delete("page");
    writeUrl(params);
  }, [fields, searchParams, writeUrl]);

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) params.delete("page");
      else params.set("page", String(page));
      writeUrl(params);
    },
    [searchParams, writeUrl]
  );

  return {
    inputValues,
    queryValues,
    setFilter,
    setFilters,
    setParams,
    clearFilters,
    setPage,
  };
};
