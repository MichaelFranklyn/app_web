import { Loading } from "@/components/Loading";
import { tableCellBase } from "../Cell/style";
import { tableRowStyle } from "../Row/style";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

/**
 * QUANDO USAR: dentro de `Table.Body` enquanto a primeira página da lista
 * carrega. `columns` = número de colunas do cabeçalho, para a grade não pular.
 * Recarga com dados já na tela (filtro, página) não troca as linhas por
 * esqueleto. Regras: PATTERNS/ds-usage-rules.md.
 */
export const Skeleton = ({ columns, rows = 5 }: TableSkeletonProps) => (
  <>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <tr key={rowIdx} className={tableRowStyle}>
        {Array.from({ length: columns }).map((_, colIdx) => (
          <td key={colIdx} className={tableCellBase}>
            {/* A célula é corpo pequeno (13px, linha de 21px): a barra ocupa a
                mesma linha do dado e a tabela não muda de altura ao chegar. */}
            <Loading.Skeleton text="body-sm" className="w-full" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

Skeleton.displayName = "Table.Skeleton";
