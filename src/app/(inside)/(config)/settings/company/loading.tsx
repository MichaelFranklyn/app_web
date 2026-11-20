import { CompanySkeleton } from "./_components/CompanySkeleton";

/**
 * A página resolve o papel e busca a ficha da empresa no servidor antes de
 * renderizar. Sem este limite de Suspense o navegador não recebe nada enquanto
 * isso não termina — em produção, com o Cloud Run dormindo, são segundos de
 * tela vazia.
 */
export default function CompanyLoading() {
  return <CompanySkeleton />;
}
