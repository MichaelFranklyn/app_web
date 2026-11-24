import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";

// O page.tsx resolve no servidor quem está criando o pedido (cookie e, em
// sessão antiga, o perfil de vendedor): sem este limite a tela ficaria em
// branco até isso voltar.
export default function NewOrderLoading() {
  return (
    <PageContent>
      {/* Mesmo agrupamento do NewOrderForm: caminho colado ao título (gap-8). */}
      <div className="flex flex-col gap-8">
        <Loading.Skeleton text="body-sm" className="w-40" />
        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Heading {...PAGE_HEADING.newOrder}>
                Novo pedido
              </PanelHeader.Heading>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>
      {[0, 1].map((card) => (
        <Card.Root key={card}>
          <Card.Header>
            <Loading.Skeleton text="body" className="w-32" />
          </Card.Header>
          <Card.Body>
            <div className="flex flex-col gap-12">
              <Loading.Skeleton className="h-[36px] w-full" />
              <Loading.Skeleton className="h-[36px] w-full" />
              <Loading.Skeleton className="h-[36px] w-2/3" />
            </div>
          </Card.Body>
        </Card.Root>
      ))}
    </PageContent>
  );
}
