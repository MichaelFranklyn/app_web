import { SelectOption } from "@/components/Input";

/**
 * Opções de um seletor de filtro tiradas das PRÓPRIAS linhas do relatório.
 *
 * Vive no pai porque quase toda aba precisa disto: os relatórios de conferência
 * chegam inteiros do backend, então o que existe na tabela é exatamente o que
 * pode ser oferecido no filtro — nenhuma fábrica no seletor que devolveria a
 * tabela vazia, e nenhuma consulta a mais para montar a lista.
 *
 * O contrário disto (opções de uma consulta própria) só se justifica onde a
 * tabela é PAGINADA no servidor: lá as linhas em memória são uma página, e
 * montar o seletor a partir delas ofereceria só os valores da página aberta.
 *
 * Ordem alfabética por rótulo (`pt-BR`, que ordena acento como letra): a lista é
 * para procurar um nome, não para ler um ranking.
 */
export const optionsFromRows = <T>(
  rows: T[],
  read: (row: T) => { value: string; label: string } | null
): SelectOption[] => {
  const seen = new Map<string, string>();
  rows.forEach((row) => {
    const entry = read(row);
    if (entry && entry.value && !seen.has(entry.value)) {
      seen.set(entry.value, entry.label);
    }
  });
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
};
