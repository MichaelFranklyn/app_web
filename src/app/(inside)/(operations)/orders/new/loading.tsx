import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";

// O page.tsx resolve no servidor quem está criando o pedido (cookie e, em
// sessão antiga, o perfil de vendedor): sem este limite a tela ficaria em
// branco até isso voltar.
export default function NewOrderLoading() {
  return (
    <PageContent>
      <Loading.Skeleton className="h-[12px] w-40" />
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Novo pedido</PanelHeader.Title>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
      {[0, 1].map((card) => (
        <Card.Root key={card}>
          <Card.Header>
            <Loading.Skeleton className="h-[14px] w-32" />
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
