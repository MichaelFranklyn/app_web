import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// A `page.tsx` busca a 1ª página no servidor; sem este limite a rota sai em
// branco durante o SSR.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Empresas"
      description="Todas as empresas da plataforma, com o uso de cada uma nos últimos 30 dias."
      actions={1}
      listTitle="Empresas da plataforma"
      columns={[
        "Empresa",
        "Plano",
        "Pessoas",
        "Clientes",
        "Volume (30d)",
        "Último acesso",
      ]}
    />
  );
}
