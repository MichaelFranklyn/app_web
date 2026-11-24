import { Card } from "@/components/Card";
import { Title } from "@/components/Title";

/** Produtos importados, mas SEM múltiplo na planilha: entraram com múltiplo 1 e
 *  precisam de revisão manual depois. */
export function DefaultedPackView({
  items,
}: {
  items: { sku: string; name: string }[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-sm" weight="medium" color="warning" className="pt-4">
        Importados com múltiplo 1 — revise ({items.length})
      </Title>
      <Title variant="caption" color="muted">
        A planilha não trazia o múltiplo/embalagem destes produtos. Eles
        entraram com múltiplo 1 — abra cada um e ajuste se vender em
        caixa/fardo.
      </Title>
      <Card.Root inset>
        <Card.Body padding="sm" className="max-h-[320px] overflow-y-auto">
          {items.map((it, i) => (
            <Title key={`${it.sku}-${i}`} variant="caption">
              <Title variant="caption" weight="medium" className="inline">
                {it.sku}
              </Title>
              {it.name ? ` ${it.name}` : ""}
            </Title>
          ))}
        </Card.Body>
      </Card.Root>
    </div>
  );
}
