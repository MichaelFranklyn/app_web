import { Breadcrumb } from "@/components/Breadcrumb";

interface Props {
  /** O lote aberto ("Lote Fábrica X", "Novo lote"); sem ele, está na lista. */
  current?: string;
}

/** Onde se está: Configuração inicial › Pedidos em PDF › lote. */
export function PdfBreadcrumb({ current }: Props) {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.Item href="/settings/import">
        Configuração inicial
      </Breadcrumb.Item>
      <Breadcrumb.Separator />
      {current ? (
        <>
          <Breadcrumb.Item href="/settings/import/pdfs">
            Pedidos em PDF
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item active className="truncate">
            {current}
          </Breadcrumb.Item>
        </>
      ) : (
        <Breadcrumb.Item active>Pedidos em PDF</Breadcrumb.Item>
      )}
    </Breadcrumb.Root>
  );
}
