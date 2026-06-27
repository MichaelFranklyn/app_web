import { Title } from "@/components/Title";

import { ImportResult, ImportRowDetail } from "./interface";

export function ImportSummary({ result }: { result: ImportResult }) {
  const hasDetails = result.errors.length > 0 || result.ignored.length > 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-3 gap-8">
        <SummaryStat
          label="Criadas"
          value={result.created}
          tone="text-(--green)"
        />
        <SummaryStat
          label="Ignoradas"
          value={result.skipped}
          tone="text-(--amber)"
        />
        <SummaryStat
          label="Com erro"
          value={result.failed}
          tone="text-(--red)"
        />
      </div>

      {hasDetails && (
        <div className="flex max-h-[180px] flex-col gap-4 overflow-y-auto rounded-lg border border-(--border) p-8">
          {result.errors.map((err) => (
            <DetailLine
              key={`err-${err.row}-${err.cnpj}`}
              label="Erro"
              tone="text-(--red)"
              detail={err}
            />
          ))}
          {result.ignored.map((item) => (
            <DetailLine
              key={`ign-${item.row}-${item.cnpj}`}
              label="Ignorada"
              tone="text-(--amber)"
              detail={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DetailLine({
  label,
  tone,
  detail,
}: {
  label: string;
  tone: string;
  detail: ImportRowDetail;
}) {
  return (
    <div className="text-xs text-(--text)">
      <Title variant="body-xs" weight="medium" className={`inline ${tone}`}>
        {label} · Linha {detail.row}
      </Title>
      {detail.cnpj ? ` (${detail.cnpj})` : ""}: {detail.message}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-(--border) py-8">
      <Title variant="heading-md" weight="semibold" className={tone}>
        {value}
      </Title>
      <Title variant="body-xs" color="muted">
        {label}
      </Title>
    </div>
  );
}
