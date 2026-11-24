import { ICON_SIZE } from "@/components/Icon";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Check, Minus } from "lucide-react";
import { PlanMatrixRow } from "../../../../../plans";

/**
 * Uma linha do comparativo. A célula aceita booleano (marca ou travessão) ou
 * texto (o teto de volume) — os dois tipos convivem na mesma tabela porque
 * respondem à mesma pergunta.
 *
 * O ícone leva `aria-label`: sozinho, um desenho de conferido não diz nada a
 * quem ouve a página, e a linha inteira perderia sentido.
 */
function MatrixCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <Table.Cell align="center">
        <Title variant="body-sm" weight="semibold">
          {value}
        </Title>
      </Table.Cell>
    );
  }

  return (
    <Table.Cell align="center">
      <div className="flex justify-center">
        {value ? (
          <Check
            size={ICON_SIZE.lg}
            className="text-(--color-status-success)"
            aria-label="Incluído"
          />
        ) : (
          <Minus
            size={ICON_SIZE.lg}
            className="text-(--color-text-muted)"
            aria-label="Não incluído"
          />
        )}
      </div>
    </Table.Cell>
  );
}

/**
 * O nome do recurso é cabeçalho DA LINHA (`th scope="row"`): o leitor de tela
 * diz "Rotina automática, Corporativo, incluído". Visualmente é corpo — sem o
 * fundo do cabeçalho e com o mesmo filete das células (inclusive sumindo na
 * última linha do grupo, como o `Table.Cell`).
 */
export function MatrixRow({
  label,
  basic,
  intermediate,
  corporate,
  enterprise,
}: PlanMatrixRow) {
  return (
    <Table.Row>
      <Table.Head
        scope="row"
        className="bg-transparent py-12 group-last:border-b-0"
      >
        <Title variant="body-sm" color="secondary">
          {label}
        </Title>
      </Table.Head>

      <MatrixCell value={basic} />
      <MatrixCell value={intermediate} />
      <MatrixCell value={corporate} />
      <MatrixCell value={enterprise} />
    </Table.Row>
  );
}
