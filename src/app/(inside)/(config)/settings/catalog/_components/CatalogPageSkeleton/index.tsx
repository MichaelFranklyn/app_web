// `Table.CardHead` vem de módulo "use client": lido a partir do `loading.tsx`
// (server) chegaria `undefined`. Mesmo motivo do `ListPageSkeleton`.
"use client";

import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { Table } from "@/components/Table";

import { CatalogPageHref } from "../../interface";
import { CATALOG_PAGES } from "../../utils";
import { CatalogSubHeader } from "../CatalogSubHeader";

interface Props {
  href: CatalogPageHref;
}

/**
 * Esqueleto de uma tela de catálogo, para o `loading.tsx` de cada uma.
 *
 * Sem ele, quem clicava num card do índice via o esqueleto do PRÓPRIO índice
 * (o `loading.tsx` de `/settings/catalog` é o limite mais próximo das filhas)
 * e a tela trocava de forma inteira ao chegar (14/11/2026). Header, nome da
 * tabela e colunas são os reais (`CATALOG_PAGES`); só as linhas ficam cinza.
 */
export function CatalogPageSkeleton({ href }: Props) {
  const { listTitle, columns } = CATALOG_PAGES[href];

  return (
    <PageContent>
      <CatalogSubHeader href={href} />

      <Table.Root>
        <Table.CardHead>
          <Table.CardHead.Title>{listTitle}</Table.CardHead.Title>
          <Table.CardHead.Actions>
            {/* Wrapper: as ações do cabeçalho forçam `w-auto` nos filhos
                diretos, e a barra sumia. No celular o botão real é só o "+". */}
            <div>
              <Loading.Skeleton className="tablet:w-[120px] h-[32px] w-40" />
            </div>
          </Table.CardHead.Actions>
        </Table.CardHead>

        <Table.Table cards>
          <Table.Header>
            <Table.Row>
              {columns.map((label) => (
                <Table.Head key={label}>{label}</Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Skeleton columns={columns.length} rows={3} />
          </Table.Body>
        </Table.Table>
      </Table.Root>
    </PageContent>
  );
}
