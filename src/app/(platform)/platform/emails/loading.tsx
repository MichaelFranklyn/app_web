import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// A página busca o histórico no servidor antes de renderizar; sem este limite
// de Suspense o navegador não recebe nada enquanto a query não volta.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Emails"
      description="O que saiu, o que chegou e quem está bloqueado."
      listTitle="Últimos envios"
      columns={["Quando", "Destinatário", "Assunto", "Situação", "Retorno"]}
    />
  );
}
