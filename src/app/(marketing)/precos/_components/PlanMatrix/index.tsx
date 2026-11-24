import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { PLAN_MATRIX } from "../../../plans";
import { Section } from "../../../_components/Section";
import { MatrixRow } from "./_components/MatrixRow";

/**
 * O comparativo linha a linha, com as peças do `Table` do design system — que
 * é uma tabela de verdade (`<table>`), não uma grade de `div`s: leitor de tela
 * anuncia "coluna Corporativo" ao ler a célula, e é isso que torna a comparação
 * utilizável sem enxergar o cabeçalho. Sem `cards`: aqui a comparação É a
 * grade, e cartão por recurso esconderia as colunas.
 *
 * Em telas estreitas ela rola dentro do wrapper do `Table.Table` — a página
 * nunca ganha barra horizontal.
 */
const COLUMNS = ["Básico", "Intermediário", "Corporativo", "Enterprise"];

export function PlanMatrix() {
  return (
    <Section tone="raised">
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="eyebrow" color="muted">
          Comparativo
        </Title>

        <Title variant="heading-lg">O que muda de um plano para o outro</Title>
      </div>

      <Table.Table className="mt-32 min-w-[720px]">
        <Table.Header>
          <tr>
            <Table.Head className="w-[36%]">
              <Title variant="label" color="muted">
                Recurso
              </Title>
            </Table.Head>

            {COLUMNS.map((column) => (
              <Table.Head key={column} align="center">
                <Title variant="heading-sm">{column}</Title>
              </Table.Head>
            ))}
          </tr>
        </Table.Header>

        {PLAN_MATRIX.map((group) => (
          <Table.Body key={group.title}>
            <tr>
              <Table.Head
                colSpan={COLUMNS.length + 1}
                className="bg-(--bg3) py-8"
              >
                <Title variant="label" color="amber">
                  {group.title}
                </Title>
              </Table.Head>
            </tr>

            {group.rows.map((row) => (
              <MatrixRow key={row.label} {...row} />
            ))}
          </Table.Body>
        ))}
      </Table.Table>
    </Section>
  );
}
