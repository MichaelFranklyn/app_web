import { SelectOption } from "@/components/Input";

interface FilterFieldBase {
  /** Rótulo mostrado acima do campo, no painel. */
  label: string;
  /** Esconde o campo sem tirá-lo da lista (ex.: vendedor só para gestor). */
  hidden?: boolean;
}

export interface FilterFieldSelect extends FilterFieldBase {
  type: "select";
  /** Chave do filtro (a mesma usada em `values` e no `onChange`). */
  key: string;
  options: SelectOption[];
  placeholder?: string;
  /** Busca server-side das opções (ver useAsyncSelectOptions). */
  onSearch?: (term: string) => void;
  loading?: boolean;
}

export interface FilterFieldDateRange extends FilterFieldBase {
  type: "date-range";
  /** Chave da data inicial (>=). */
  key: string;
  /** Chave da data final (<=). */
  toKey: string;
}

export interface FilterFieldText extends FilterFieldBase {
  type: "text";
  /** Chave do filtro (a mesma usada em `values` e no `onChange`). */
  key: string;
  placeholder?: string;
}

export type FilterField =
  | FilterFieldSelect
  | FilterFieldDateRange
  | FilterFieldText;

export interface FiltersProps {
  fields: FilterField[];
  /** Valores atuais por chave (datas em ISO yyyy-mm-dd). */
  values: Record<string, string>;
  /**
   * Aplica um conjunto de chaves de uma vez (valor vazio limpa a chave).
   * É um patch, e não uma chave só, porque o período mexe em duas pontas ao
   * mesmo tempo — ver `setFilters` em useTableFilters.
   */
  onChange: (patch: Record<string, string | undefined>) => void;
  /**
   * Aplica UMA chave, respeitando o debounce declarado para o campo — é o
   * `setFilter` de useTableFilters.
   *
   * Existe por causa dos campos de texto: `onChange` vale na hora, então cada
   * tecla digitada viraria uma consulta ao backend e uma entrada no histórico.
   * Sem esta prop, o campo de texto cai no `onChange` mesmo.
   */
  onTextChange?: (key: string, value: string | undefined) => void;
  /** Texto do botão quando nenhum filtro está ativo. */
  label?: string;
  /** Âncora do tour guiado (o passo aponta para o botão). */
  "data-tour"?: string;
}
