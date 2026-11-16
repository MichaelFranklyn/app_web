import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING, PageHeadingKey } from "@/utils/modules";

interface PortalPageHeaderProps {
  /** O ícone e a cor do módulo — os mesmos das telas do sistema. */
  heading: PageHeadingKey;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Onde o cliente está ("Pedidos › Fábrica"), acima do título. */
  breadcrumb?: React.ReactNode;
  /** Situação da tela (ex.: o badge do pedido), na linha das ações. */
  badges?: React.ReactNode;
  /** Botões ou links da página. */
  actions?: React.ReactNode;
}

/**
 * O cabeçalho das telas do portal — o MESMO `PanelHeader` do sistema (ícone do
 * módulo + título + descrição), para o cliente ver a tela com a cara da
 * plataforma que o representante usa. Breadcrumb e linha de badges + ações
 * seguem o detalhe de pedido do escritório.
 */
export function PortalPageHeader({
  heading,
  title,
  description,
  breadcrumb,
  badges,
  actions,
}: PortalPageHeaderProps) {
  const header = (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Heading {...PAGE_HEADING[heading]}>
            {title}
          </PanelHeader.Heading>
          {description ? (
            <PanelHeader.Description>{description}</PanelHeader.Description>
          ) : null}
          {badges ? (
            <div className="max-tablet:mt-16 max-tablet:[&>span]:w-full mt-6 flex flex-wrap items-center gap-8">
              {badges}
              {actions ? (
                <PanelHeader.Actions className="max-tablet:basis-full w-auto grow">
                  {actions}
                </PanelHeader.Actions>
              ) : null}
            </div>
          ) : actions ? (
            <PanelHeader.Actions className="mt-6">
              {actions}
            </PanelHeader.Actions>
          ) : null}
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );

  if (!breadcrumb) return header;
  return (
    <div className="flex flex-col gap-8">
      <div className="print-hide">{breadcrumb}</div>
      {header}
    </div>
  );
}
