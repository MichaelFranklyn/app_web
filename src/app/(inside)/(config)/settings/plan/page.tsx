import { gqlFetch } from "@/services/graphql/gqlFetch";
import { MY_PLAN_QUERY, MyPlanQueryData } from "@/services/plan";
import { requireOwnerPage } from "@/utils/auth/roleGuard";
import PlanContent from "./content";

const Page = async () => {
  // O contrato é assunto de quem responde por ele. O vendedor não abre — para
  // ele, o efeito do plano é o menu já não mostrar o que a empresa não tem.
  await requireOwnerPage("/profile");

  // O plano buscado no SERVIDOR, para semear o cache do Apollo no cliente: sem
  // isto a tela ficava num retângulo cinza de 420px enquanto o navegador baixava
  // o JS da rota para só então descobrir que precisava dos dados.
  //
  // O seed não briga com o `cache-and-network` do content — pelo contrário: ele
  // dá o primeiro desenho na hora e a revalidação continua acontecendo, que é
  // justamente o que aquela política quer (a contagem de uso envelhece a cada
  // cadastro feito noutra tela).
  //
  // Falha vira `null` e o cliente busca por conta própria.
  let seed: MyPlanQueryData | null = null;
  try {
    const { data } = await gqlFetch<MyPlanQueryData>({ query: MY_PLAN_QUERY });
    // Só semeia com CONTEÚDO: um seed vazio faria o `cache-first` acertar um
    // "hit" sem dados e a tela mostraria o erro de carregamento sem tentar de novo.
    seed = data?.myPlan?.data ? data : null;
  } catch {
    seed = null;
  }

  return <PlanContent seed={seed} />;
};

export default Page;
