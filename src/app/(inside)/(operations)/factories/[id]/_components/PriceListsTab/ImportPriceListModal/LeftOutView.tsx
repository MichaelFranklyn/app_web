import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { plural } from "@/utils/format/plural";

/** Linhas que não chegaram a ser importadas: descartadas no mapeamento (sem
 *  código/descrição) ou ilegíveis no PDF (texto sobreposto). */
export function LeftOutView({
  skipped,
  unreadable,
}: {
  skipped: { sku: string; name: string; reason: string }[];
  unreadable: string[];
}) {
  // Produtos identificáveis primeiro (têm código); linhas sem código viram contagem.
  const named = skipped.filter((s) => s.sku);
  const noCode = skipped.length - named.length;
  return (
    <div className="flex flex-col gap-8">
      <Title variant="body-sm" weight="medium" color="warning" className="pt-4">
        Linhas que ficaram de fora ({skipped.length + unreadable.length})
      </Title>
      {(named.length > 0 || unreadable.length > 0) && (
        <Card.Root inset>
          <Card.Body padding="sm" className="max-h-[320px] overflow-y-auto">
            {named.map((s, i) => (
              <Title key={`named-${s.sku}-${i}`} variant="caption">
                <Title variant="caption" weight="medium" className="inline">
                  {s.sku}
                </Title>
                {s.name ? ` ${s.name}` : ""} — {s.reason}
              </Title>
            ))}
            {unreadable.map((desc, i) => (
              <Title key={`unreadable-${i}`} variant="caption">
                <Title variant="caption" weight="medium" className="inline">
                  {desc}
                </Title>{" "}
                — código ilegível no PDF (texto sobreposto); ache o código no
                arquivo e cadastre à mão
              </Title>
            ))}
          </Card.Body>
        </Card.Root>
      )}
      {noCode > 0 && (
        <Title variant="caption" color="muted">
          {plural(
            noCode,
            "linha sem código foi ignorada",
            "linhas sem código foram ignoradas"
          )}{" "}
          (títulos, totais e observações no meio dos dados).
        </Title>
      )}
    </div>
  );
}
