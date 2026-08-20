import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// Espelha `content.tsx`: cabeçalho + 4 KPIs + tabela da carteira. A página faz
// duas queries no servidor (stats + 1ª página) antes de renderizar — sem este
// limite de Suspense, o navegador não recebe nada enquanto elas não voltam.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Clientes"
      description="Carteira de clientes da empresa. Dados globais complementados com informações privadas."
      actions={3}
      kpis={{ count: 4 }}
      listTitle="Carteira de clientes"
      // As MESMAS seis colunas do `ClientsTable`, na mesma ordem: o esqueleto
      // trazia uma sétima ("Faturamento") que a tabela não tem, e a linha
      // inteira se reorganizava quando os dados chegavam.
      columns={[
        "Cliente",
        "Cidade",
        "Vendedor",
        "Última Compra",
        "Última Visita",
        "Score",
      ]}
    />
  );
}
