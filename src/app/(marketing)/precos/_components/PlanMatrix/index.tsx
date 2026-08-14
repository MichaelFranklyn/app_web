import { Title } from "@/components/Title";
import { PLAN_MATRIX } from "../../../plans";
import { Section } from "../../../_components/Section";
import { MatrixRow } from "./_components/MatrixRow";

/**
 * O comparativo linha a linha. Uma tabela de verdade (`<table>`), não uma grade
 * de `div`s: leitor de tela anuncia "coluna Pro" ao ler a célula, e é isso que
 * torna a comparação utilizável sem enxergar o cabeçalho.
 *
 * Em telas estreitas ela rola dentro do próprio contêiner — a página nunca
 * ganha barra horizontal.
 */
const COLUMNS = ["Básico", "Pro", "Enterprise"];

export function PlanMatrix() {
  return (
    <Section tone="raised">
      <div className="flex max-w-[640px] flex-col gap-12">
        <Title variant="eyebrow" color="muted">
          Comparativo
        </Title>

        <Title variant="heading-lg">O que muda de um plano para o outro</Title>
      </div>

      <div className="mt-32 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-(--border2)">
              <th className="w-[40%] px-12 py-12 text-left">
                <Title variant="label" color="muted">
                  Recurso
                </Title>
              </th>

              {COLUMNS.map((column) => (
                <th key={column} className="px-12 py-12 text-center">
                  <Title variant="heading-sm">{column}</Title>
                </th>
              ))}
            </tr>
          </thead>

          {PLAN_MATRIX.map((group) => (
            <tbody key={group.title}>
              <tr className="bg-(--bg3)">
                <th colSpan={4} className="px-12 py-8 text-left">
                  <Title variant="label" color="amber">
                    {group.title}
                  </Title>
                </th>
              </tr>

              {group.rows.map((row) => (
                <MatrixRow key={row.label} {...row} />
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </Section>
  );
}
