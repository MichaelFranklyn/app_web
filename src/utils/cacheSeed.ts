import { DocumentNode, Kind } from "graphql";

/**
 * Quais campos uma mutation já invalidou nesta sessão de navegação.
 *
 * Existe por causa de um "só reflete com F5" que só aparecia em PRODUÇÃO. O
 * seed do SSR (`useTableData` initialData, `useSeedQuery`) escreve no cache do
 * Apollo quando ele está frio — e uma invalidação deixa o campo exatamente
 * assim. Na volta para a lista, o Next serve o payload RSC do Router Cache, que
 * foi prefetchado ANTES da mutation (a sidebar prefetcha todas as rotas): o
 * seed reescrevia esse dado velho, o `cache-first` acertava e a query nunca ia
 * à rede. Medido em `/orders` após editar um item: `orderStats` (sem seed)
 * atualizava e a lista ficava com o valor anterior até um reload.
 *
 * Em `next dev` não aparece porque lá o payload RSC é refeito a cada navegação.
 *
 * O registro vive em memória e morre no reload — que é justamente quando o SSR
 * volta a ser a fonte mais nova.
 */
const invalidatedFields = new Set<string>();

/** Chamado pela invalidação do cache (ver `useInvalidateQueries`). */
export const markFieldsInvalidated = (fieldNames: string[]): void => {
  fieldNames.forEach((fieldName) => {
    if (fieldName) invalidatedFields.add(fieldName);
  });
};

/** Algum destes campos já foi invalidado? Então o seed não vale mais. */
export const hasInvalidatedField = (fieldNames: string[]): boolean =>
  fieldNames.some((fieldName) => invalidatedFields.has(fieldName));

/** Só para os testes: zera o registro entre casos. */
export const resetInvalidatedFields = (): void => {
  invalidatedFields.clear();
};

/**
 * Campos de topo do documento pelo nome do SCHEMA, nunca pelo alias — é assim
 * que o cache do Apollo os guarda, e é assim que a invalidação os nomeia
 * (`clients_list: clients` conta como `clients`).
 */
export const rootFieldNames = (query: DocumentNode): string[] => {
  const names: string[] = [];
  for (const definition of query.definitions) {
    if (definition.kind !== Kind.OPERATION_DEFINITION) continue;
    for (const selection of definition.selectionSet.selections) {
      if (selection.kind === Kind.FIELD) names.push(selection.name.value);
    }
  }
  return names;
};
