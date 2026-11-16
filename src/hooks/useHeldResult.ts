import { useState } from "react";

interface QueryLike<T> {
  data: T | undefined;
  previousData?: T | undefined;
  error?: unknown;
}

/**
 * A resposta que a tela mostra quando um `useQuery` segura a anterior
 * (`data ?? previousData`) enquanto o recorte novo carrega.
 *
 * Segurar a anterior evita o esqueleto piscando a cada clique, mas o
 * `previousData` do Apollo é a última resposta, seja de que recorte for. Se a
 * busca do recorte novo FALHA (sem rede, por exemplo), `data` fica vazio e
 * `data ?? previousData` deixava na tela os números do mês anterior sob o
 * rótulo do mês novo, sem erro nenhum. Aqui a anterior só vale para segurar
 * o MESMO recorte. Num recorte novo que falhou, `failed` liga e a tela troca
 * o conteúdo pelo `QueryError`.
 *
 * @param variables o recorte pedido (as `variables` do useQuery).
 */
export function useHeldResult<T>(
  { data, previousData, error }: QueryLike<T>,
  variables: unknown
): { shown: T | undefined; failed: boolean } {
  const key = JSON.stringify(variables ?? null);
  // O recorte da última resposta que chegou (ajuste de estado no render, o
  // padrão do React para "lembrar do valor anterior").
  const [answeredKey, setAnsweredKey] = useState<string | null>(null);
  if (data !== undefined && answeredKey !== key) setAnsweredKey(key);

  const isNewRecorte = data === undefined && answeredKey !== key;
  if (
    error &&
    (data ?? (isNewRecorte ? undefined : previousData)) === undefined
  )
    return { shown: undefined, failed: true };
  return { shown: data ?? previousData, failed: false };
}
