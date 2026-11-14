import { TenantSkeleton } from "./_components/TenantSkeleton";

/**
 * A página busca a ficha do tenant no servidor antes de renderizar — sem este
 * limite de Suspense, entrar na rota deixava a tela em branco até a resposta
 * chegar. O mesmo esqueleto cobre o early-return do `content.tsx`.
 */
export default function TenantDetailLoading() {
  return <TenantSkeleton />;
}
