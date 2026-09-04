import { SUPPORT_CASES_QUERY } from "@/graphql/support";
import { executeServerQueries } from "@/services/graphql/getDataServer";

import SupportContent from "./content";
import { SupportCasesData } from "./interface";
import { ITEMS_PER_PAGE } from "./utils";

/**
 * A fila de atendimentos. Sem guard de papel: o vendedor entra e vê os casos
 * dos clientes DELE (o recorte é no resolver), o gestor vê a empresa inteira —
 * é ele quem trabalha a fila.
 */
const Page = async () => {
  // 1ª página no shape da própria query → semeia o cache do Apollo no cliente
  // e a lista pinta sem waterfall.
  const data = await executeServerQueries<SupportCasesData>({
    support_cases: {
      query: SUPPORT_CASES_QUERY,
      // Sem `order`: o backend já ordena pelo relato mais recente, e as
      // variables precisam bater byte a byte com as do estado inicial do
      // `useTableData` — senão o cache semeado aqui nunca é aproveitado.
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: ["client_support_cases"] },
    },
  });

  return <SupportContent initialData={data} />;
};

export default Page;
