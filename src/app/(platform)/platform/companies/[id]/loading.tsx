import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";

/**
 * Espelha o early-return de `content.tsx` (cabeçalho + cartões da empresa).
 *
 * A página busca a ficha do tenant no servidor antes de renderizar — sem este
 * limite de Suspense, entrar na rota deixava a tela em branco até a resposta
 * chegar, que é justamente o que o esqueleto do content já evitava DEPOIS.
 */
export default function TenantDetailLoading() {
  return (
    <PageContent>
      <Loading.Skeleton className="h-[80px] w-full" />
      <Loading.Skeleton className="h-[200px] w-full" />
      <Loading.Skeleton className="h-[200px] w-full" />
    </PageContent>
  );
}
