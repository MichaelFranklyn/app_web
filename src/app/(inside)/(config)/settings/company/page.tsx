import { gqlFetch } from "@/services/graphql/gqlFetch";
import { requireOwnerPage } from "@/utils/auth/roleGuard";
import CompanyContent from "./content";
import { MY_COMPANY_QUERY } from "./gql";
import { MyCompanyQueryData } from "./interface";

const Page = async () => {
  // Cadastro da própria empresa é do dono da conta (updateCompany é @is_owner
  // no backend) — quem não for owner volta ao próprio perfil.
  await requireOwnerPage("/profile");

  // A ficha buscada no SERVIDOR, para semear o cache do Apollo no cliente.
  // Sem isto o navegador só descobria que precisava dela depois de baixar e
  // executar o JS da rota: a tela ficava num retângulo cinza de 420px enquanto
  // uma ida à rede que já podia ter acontecido não tinha nem começado.
  //
  // Falha vira `null` e o cliente busca por conta própria — o seed é
  // otimização, não pré-requisito.
  let seed: MyCompanyQueryData | null = null;
  try {
    const { data } = await gqlFetch<MyCompanyQueryData>({
      query: MY_COMPANY_QUERY,
    });
    // Só semeia com CONTEÚDO: um seed vazio faria o `cache-first` acertar um
    // "hit" sem dados e a tela mostraria o erro de carregamento sem nunca
    // tentar de novo.
    seed = data?.my_company?.data ? data : null;
  } catch {
    seed = null;
  }

  return <CompanyContent seed={seed} />;
};

export default Page;
