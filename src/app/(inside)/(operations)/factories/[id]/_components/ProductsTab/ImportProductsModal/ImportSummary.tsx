import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import { Title } from "@/components/Title";
import { TitleColor } from "@/components/Title/interface";

import { ImportResult, ImportRowDetail } from "./interface";

export function ImportSummary({ result }: { result: ImportResult }) {
  const hasDetails = result.errors.length > 0 || result.ignored.length > 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-3 gap-8">
        <StatCard label="Criados" value={result.created} tone="green" />
        <StatCard label="Ignorados" value={result.skipped} tone="amber" />
        <StatCard label="Com erro" value={result.failed} tone="red" />
      </div>

      {hasDetails && (
        <Card.Root isCompact className="flex max-h-[180px] flex-col gap-4 overflow-y-auto">
          {result.errors.map((err) => (
            <DetailLine key={`err-${err.row}-${err.sku}`} label="Erro" tone="red" detail={err} />
          ))}
          {result.ignored.map((item) => (
            <DetailLine key={`ign-${item.row}-${item.sku}`} label="Ignorado" tone="amber" detail={item} />
          ))}
        </Card.Root>
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
  tone: TitleColor;
  detail: ImportRowDetail;
}) {
  return (
    <Title variant="caption">
      <Title variant="caption" color={tone} weight="medium" className="inline">
        {label} · Linha {detail.row}
      </Title>
      {detail.sku ? ` (${detail.sku})` : ""}: {detail.message}
    </Title>
  );
}
