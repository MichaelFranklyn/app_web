import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { TitleColor } from "@/components/Title/interface";

export interface StatCardProps {
  label: string;
  value: number | string;
  /** Cor do número (ex.: green p/ sucesso, red p/ erro). */
  tone?: TitleColor;
}

/**
 * Número grande com legenda, para grades de resumo — ex.: resultado de
 * importações ("Criados / Ignorados / Com erro").
 *
 * @example
 * <div className="grid grid-cols-3 gap-8">
 *   <StatCard label="Criados" value={12} tone="green" />
 * </div>
 */
export function StatCard({ label, value, tone = "muted" }: StatCardProps) {
  return (
    <Card.Root isCompact className="flex flex-col items-center gap-2">
      <Title variant="heading-md" color={tone}>
        {value}
      </Title>
      <Title variant="caption" color="muted">
        {label}
      </Title>
    </Card.Root>
  );
}
