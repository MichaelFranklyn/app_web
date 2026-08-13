import { gqlFetch } from "@/services/graphql/gqlFetch";
import { requireSuPage } from "@/utils/auth/roleGuard";
import PlatformTeamContent from "./content";
import { PLATFORM_STAFF_QUERY } from "./gql";
import { StaffQueryData } from "./interface";

/**
 * A única tela do console que o suporte não abre.
 *
 * O guard é repetido aqui — o do `layout.tsx` deixa entrar quem é da plataforma,
 * incluindo o suporte. Sem esta segunda linha, a página abriria para ele e só
 * quebraria na query, que é a forma mais confusa possível de dizer "você não
 * pode": tela montada, dados vazios e um erro no console do navegador.
 */
const Page = async () => {
  await requireSuPage();

  let seed: StaffQueryData | null = null;
  try {
    const { data } = await gqlFetch<StaffQueryData>({
      query: PLATFORM_STAFF_QUERY,
    });
    // Lista vazia é impossível na prática (quem abre a tela está nela), mas a
    // condição olha para `data` e não para o tamanho: o que não pode ser semeado
    // é a AUSÊNCIA de resposta.
    seed = data?.platformStaff?.data ? data : null;
  } catch {
    seed = null;
  }

  return <PlatformTeamContent seed={seed} />;
};

export default Page;
