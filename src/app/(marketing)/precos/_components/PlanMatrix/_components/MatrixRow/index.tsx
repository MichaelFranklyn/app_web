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
      <td className="px-12 py-12 text-center">
        <Title variant="body-sm" weight="semibold">
          {value}
        </Title>
      </td>
    );
  }

  return (
    <td className="px-12 py-12">
      <div className="flex justify-center">
        {value ? (
          <Check size={18} className="text-(--green)" aria-label="Incluído" />
        ) : (
          <Minus size={18} className="text-(--dim)" aria-label="Não incluído" />
        )}
      </div>
    </td>
  );
}

export function MatrixRow({ label, basic, pro, enterprise }: PlanMatrixRow) {
  return (
    <tr className="border-b border-(--border)">
      <th className="px-12 py-12 text-left font-(--weight-regular)">
        <Title variant="body-sm" color="secondary">
          {label}
        </Title>
      </th>

      <MatrixCell value={basic} />
      <MatrixCell value={pro} />
      <MatrixCell value={enterprise} />
    </tr>
  );
}
