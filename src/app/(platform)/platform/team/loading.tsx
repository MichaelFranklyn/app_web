import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// A página busca a equipe no servidor antes de renderizar; sem este limite de
// Suspense o navegador não recebe nada enquanto a query não volta.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Equipe da plataforma"
      description="Quem enxerga todas as empresas. Contas de suporte são criadas e revogadas aqui."
      actions={1}
      listTitle="Contas"
      columns={["Pessoa", "Papel", "Criada em", ""]}
    />
  );
}
