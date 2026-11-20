import { Emphasis } from "@/components/Emphasis";
import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// Espelha `content.tsx`. A página busca a 1ª página no SERVIDOR: sem este
// limite de Suspense o navegador não recebe nada enquanto a consulta não
// responde, e a tela fica em branco.
export default function Loading() {
  return (
    <ListPageSkeleton
      page="support"
      eyebrow={{ label: "Clientes", color: "green" }}
      title={
        <>
          Reclamações <Emphasis tone="accent">de clientes</Emphasis>
        </>
      }
      help
      description="Os problemas que os clientes relatam e o que já foi feito sobre cada um — mercadoria, pagamento, entrega."
      actions={1}
      kpis={{
        count: 4,
        cols: { base: 2, tablet: 4 },
        delta: false,
        gap: 8,
      }}
      listTitle={false}
      listActions={["w-[200px] desktop:w-72", "w-[90px]"]}
      cards
      sortable
      columns={[
        "Assunto",
        "Cliente",
        "Fábrica",
        "Situação",
        "Urgência",
        "Esperando",
        "Último andamento",
      ]}
    />
  );
}
