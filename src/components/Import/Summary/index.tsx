import { Card } from "@/components/Card";

import { Title, TitleColor } from "@/components/Title";

export interface ImportSummaryDetail {
  row: number;
  message: string;
}

export interface ImportSummaryResult<T extends ImportSummaryDetail> {
  created: number;
  skipped: number;
  failed: number;
  errors: T[];
  ignored: T[];
}

interface ImportSummaryProps<T extends ImportSummaryDetail> {
  result: ImportSummaryResult<T>;
  /** O que identifica a linha para quem conferir a planilha (CNPJ, SKU). */
  identify: (detail: T) => string;
  /** Concordância com o que foi importado: "fábricas" pede "Ignoradas". */
  feminine?: boolean;
  /** O verbo de quem entrou: cliente é "Adicionado" à carteira, não criado. */
  createdLabel?: string;
}

/**
 * Resultado de uma importação por planilha: três números (criados, ignorados,
 * com erro) e, quando houver, a lista das linhas que não entraram e por quê.
 */
export function Summary<T extends ImportSummaryDetail>({
  result,
  identify,
  feminine = false,
  createdLabel,
}: ImportSummaryProps<T>) {
  const hasDetails = result.errors.length > 0 || result.ignored.length > 0;
  const ignoredLabel = feminine ? "Ignorada" : "Ignorado";

  return (
    <div className="flex flex-col gap-10">
      <Card.Kpi.Group>
        <Card.Kpi>
          <Card.Kpi.Label>
            {createdLabel ?? (feminine ? "Criadas" : "Criados")}
          </Card.Kpi.Label>
          <Card.Kpi.Value status="ok">{result.created}</Card.Kpi.Value>
        </Card.Kpi>
        <Card.Kpi>
          <Card.Kpi.Label>{`${ignoredLabel}s`}</Card.Kpi.Label>
          <Card.Kpi.Value status="atencao">{result.skipped}</Card.Kpi.Value>
        </Card.Kpi>
        <Card.Kpi>
          <Card.Kpi.Label>Com erro</Card.Kpi.Label>
          <Card.Kpi.Value status="urgente">{result.failed}</Card.Kpi.Value>
        </Card.Kpi>
      </Card.Kpi.Group>

      {hasDetails && (
        <Card.Root inset>
          <Card.Body padding="sm" className="max-h-[180px] overflow-y-auto">
            {result.errors.map((detail) => (
              <DetailLine
                key={`err-${detail.row}-${identify(detail)}`}
                label="Erro"
                tone="red"
                identifier={identify(detail)}
                detail={detail}
              />
            ))}
            {result.ignored.map((detail) => (
              <DetailLine
                key={`ign-${detail.row}-${identify(detail)}`}
                label={ignoredLabel}
                tone="warning"
                identifier={identify(detail)}
                detail={detail}
              />
            ))}
          </Card.Body>
        </Card.Root>
      )}
    </div>
  );
}

function DetailLine({
  label,
  tone,
  identifier,
  detail,
}: {
  label: string;
  tone: TitleColor;
  identifier: string;
  detail: ImportSummaryDetail;
}) {
  return (
    <Title variant="body-xs">
      <Title variant="body-xs" color={tone} weight="medium" className="inline">
        {label} · Linha {detail.row}
      </Title>
      {identifier ? ` (${identifier})` : ""}: {detail.message}
    </Title>
  );
}
