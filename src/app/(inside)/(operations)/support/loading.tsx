import { ListPageSkeleton } from "@/components/ListPageSkeleton";

// Espelha `content.tsx`. A página busca a 1ª página no SERVIDOR: sem este
// limite de Suspense o navegador não recebe nada enquanto a consulta não
// responde, e a tela fica em branco.
export default function Loading() {
  return (
    <ListPageSkeleton
      title="Atendimentos do cliente"
      description="Os problemas que os clientes relatam e o que já foi feito sobre cada um."
      actions={1}
      listTitle="Atendimentos"
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
