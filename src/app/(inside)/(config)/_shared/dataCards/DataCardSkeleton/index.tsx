"use client";

// Client: `Card.Header` é client e, num componente de servidor, o acesso por
// ponto (`Card.Header.Actions`) chega `undefined` — o loading.tsx quebrava.
import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";

interface Props {
  /** Quantos campos (`Card.Field`) o card real mostra. */
  fields: number;
  /** Colunas da grade de campos no desktop — no celular é sempre uma. */
  desktopCols?: 2 | 3;
  /** O card real tem uma nota de rodapé abaixo dos campos. */
  note?: boolean;
}

/** Placeholder de um campo: rótulo em cima, valor embaixo (igual ao Card.Field). */
function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Loading.Skeleton text="body-sm" className="w-[72px]" />
      <Loading.Skeleton text="body-md" className="w-[160px] max-w-full" />
    </div>
  );
}

/**
 * Placeholder de um card de cadastro (perfil da pessoa, dados da empresa):
 * título, descrição, o botão âmbar de editar e os campos em leitura.
 *
 * No celular os campos empilham numa coluna e a descrição quebra em duas
 * linhas — o esqueleto faz o mesmo, senão a troca para a tela real "pula"
 * (relato de 20/11/2026: blocos lisos que não lembravam a tela).
 */
export function DataCardSkeleton({ fields, desktopCols = 2, note }: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Loading.Skeleton text="heading-sm" className="w-[160px] max-w-full" />
        <div className="mt-8 flex flex-col gap-6">
          <Loading.Skeleton text="body-sm" className="w-[224px] max-w-full" />
          <Loading.Skeleton
            text="body-sm"
            className="desktop:hidden w-[112px]"
          />
        </div>
        <Card.Header.Actions>
          {/* Wrapper: as ações do header forçam `w-auto` nos filhos diretos. */}
          <div>
            <Loading.Skeleton className="h-[32px] w-[40px]" />
          </div>
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body>
        <Grid.Root cols={{ base: 1, desktop: desktopCols }} gap={16}>
          {Array.from({ length: fields }).map((_, i) => (
            <Grid.Item key={i}>
              <FieldSkeleton />
            </Grid.Item>
          ))}
        </Grid.Root>
        {note && (
          <div className="flex flex-col gap-6">
            <Loading.Skeleton text="body-sm" className="w-full" />
            <Loading.Skeleton text="body-sm" className="w-2/3" />
          </div>
        )}
      </Card.Body>
    </Card.Root>
  );
}
