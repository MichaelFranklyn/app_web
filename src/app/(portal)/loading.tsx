import { Loading } from "@/components/Loading";
import { PublicPage } from "@/components/PublicPage";

/**
 * Limite de Suspense do grupo inteiro — e o único que cobre o fetch do
 * `p/[token]/layout.tsx`.
 *
 * O `loading.tsx` de um segmento envolve a PÁGINA daquele segmento, não o
 * `layout.tsx` dele: enquanto o layout do portal busca o perfil do cliente,
 * nenhum limite lá de dentro chegou a existir ainda, e o navegador não recebe
 * nada. Quem abre o link no 4G da loja olha uma tela branca até o Cloud Run
 * responder. Ver [[feedback_nextjs_layout_loading_suspense]].
 *
 * Por isso este é deliberadamente genérico: ele aparece ANTES de o sistema
 * saber de quem é a página. Os esqueletos com a cara de cada tela ficam nos
 * `loading.tsx` de dentro, que entram assim que o perfil resolve.
 */
export default function PortalGroupLoading() {
  return (
    <PublicPage.Root>
      <PublicPage.Header className="gap-[6px]">
        <Loading.Skeleton className="h-[20px] w-[200px]" />
        <Loading.Skeleton className="h-[14px] w-[140px]" />
      </PublicPage.Header>
      <PublicPage.Main>
        <Loading.Skeleton className="h-[180px] w-full" />
      </PublicPage.Main>
    </PublicPage.Root>
  );
}
