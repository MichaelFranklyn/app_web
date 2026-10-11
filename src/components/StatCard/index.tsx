import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { TitleColor } from "@/components/Title";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number | string;
  /** Cor do número (ex.: green p/ sucesso, red p/ erro). */
  tone?: TitleColor;
  /**
   * O cartão vira um FILTRO: clicar aplica o recorte que ele conta (as
   * pendências atrasadas, as de hoje). Sem `onClick`, é só leitura.
   */
  onClick?: () => void;
  /** O recorte deste cartão é o que está valendo agora. */
  active?: boolean;
  /** Explicação do número — vai no `title` (o cartão clicável é um botão). */
  hint?: string;
  "data-tour"?: string;
}

/**
 * Número grande com legenda, para grades de resumo — ex.: resultado de
 * importações ("Criados / Ignorados / Com erro").
 *
 * Com `onClick`, o cartão é um interruptor de filtro (`aria-pressed`): o ativo
 * fica com a borda âmbar, a mesma cor de "escolhido" do `ToggleGroup`.
 *
 * @example
 * <div className="grid grid-cols-3 gap-8">
 *   <StatCard label="Criados" value={12} tone="green" />
 * </div>
 */
export function StatCard({
  label,
  value,
  tone = "muted",
  onClick,
  active = false,
  hint,
  "data-tour": dataTour,
}: StatCardProps) {
  const body = (
    <>
      <Title variant="heading-md" color={tone}>
        {value}
      </Title>
      <Title variant="caption" color="muted">
        {label}
      </Title>
    </>
  );

  if (!onClick) {
    return (
      <Card.Root
        isCompact
        className="flex flex-col items-center gap-2"
        title={hint}
        data-tour={dataTour}
      >
        {body}
      </Card.Root>
    );
  }

  return (
    <Card.Button
      onClick={onClick}
      aria-pressed={active}
      title={hint}
      data-tour={dataTour}
      className={cn(
        "items-center gap-2 p-12",
        active && "border-(--amber) bg-(--amber-bg)"
      )}
    >
      {body}
    </Card.Button>
  );
}
