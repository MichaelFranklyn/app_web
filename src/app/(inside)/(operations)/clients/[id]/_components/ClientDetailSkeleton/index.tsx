import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { Table } from "@/components/Table";

/** Placeholder genérico de um card (título + ação opcional + linhas de conteúdo). */
function CardSkeleton({
  lines = 3,
  hasAction = false,
}: {
  lines?: number;
  hasAction?: boolean;
}) {
  return (
    <Card.Root>
      <Card.Header>
        <Loading.Skeleton className="h-[14px] w-32" />
        {hasAction && (
          <Card.Header.Actions>
            <Loading.Skeleton className="h-[28px] w-20" />
          </Card.Header.Actions>
        )}
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-[10px]">
          {Array.from({ length: lines }).map((_, i) => (
            <Loading.Skeleton key={i} className="h-[12px] w-full" />
          ))}
        </div>
      </Card.Body>
    </Card.Root>
  );
}

/**
 * Placeholder do CONTEÚDO do detalhe do cliente (área abaixo das abas).
 *
 * O layout client (`layout.tsx`) já renderiza breadcrumb, cabeçalho (com seu
 * próprio skeleton) e a barra de abas — por isso este skeleton cobre só a
 * região de conteúdo, senão o chrome apareceria duplicado durante o loading.
 * Espelha a Visão Geral (aba padrão de `/clients/[id]`): coluna principal
 * (endereço, vínculos, contatos) + coluna lateral (resumo, notas).
 */
export function ClientDetailSkeleton() {
  return (
    <div className="flex items-start gap-20">
      <div className="flex min-w-0 flex-1 flex-col gap-16">
        <Card.Root>
          <Card.Header>
            <Loading.Skeleton className="h-[14px] w-24" />
            <Card.Header.Actions>
              <Loading.Skeleton className="h-[28px] w-20" />
            </Card.Header.Actions>
          </Card.Header>
          <Card.Body>
            <Loading.Skeleton className="mb-12 h-[12px] w-3/4" />
            <Loading.Skeleton className="h-50 w-full rounded-(--r-lg)" />
          </Card.Body>
        </Card.Root>

        <Table.Root>
          <Table.CardHead>
            <Loading.Skeleton className="h-[14px] w-40" />
            <Table.CardHead.Actions>
              <Loading.Skeleton className="h-[28px] w-24" />
            </Table.CardHead.Actions>
          </Table.CardHead>
          <Table.Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Fábrica</Table.Head>
                <Table.Head>Vendedor</Table.Head>
                <Table.Head>Prioridade</Table.Head>
                <Table.Head>Frequência</Table.Head>
                <Table.Head>Última Visita</Table.Head>
                <Table.Head>Status</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Skeleton columns={6} rows={3} />
            </Table.Body>
          </Table.Table>
        </Table.Root>

        <CardSkeleton lines={4} hasAction />
      </div>

      <div className="flex w-65 shrink-0 flex-col gap-12">
        <CardSkeleton lines={3} />
        <CardSkeleton lines={2} hasAction />
      </div>
    </div>
  );
}
