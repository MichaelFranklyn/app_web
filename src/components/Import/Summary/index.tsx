import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
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
  /** Concordância com o que foi importado: "fábricas" pede "Criadas". */
  feminine?: boolean;
}

/**
 * Resultado de uma importação por planilha: três números (criados, ignorados,
 * com erro) e, quando houver, a lista das linhas que não entraram e por quê.
 */
export function Summary<T extends ImportSummaryDetail>({
  result,
  identify,
  feminine = false,
}: ImportSummaryProps<T>) {
  const hasDetails = result.errors.length > 0 || result.ignored.length > 0;
  const ignoredLabel = feminine ? "Ignorada" : "Ignorado";

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-3 gap-8">
        <StatCard
          label={feminine ? "Criadas" : "Criados"}
          value={result.created}
          tone="green"
        />
        <StatCard
          label={`${ignoredLabel}s`}
          value={result.skipped}
          tone="amber"
        />
        <StatCard label="Com erro" value={result.failed} tone="red" />
      </div>

      {hasDetails && (
        <Card.Root inset>
          <Card.Body
            padding="sm"
            className="max-h-[180px] gap-4 overflow-y-auto"
          >
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
                tone="amber"
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
