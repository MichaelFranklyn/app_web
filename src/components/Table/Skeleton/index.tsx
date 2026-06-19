import { Loading } from "@/components/Loading";
import { tableCellBase } from "../Cell/style";
import { tableRowStyle } from "../Row/style";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export const Skeleton = ({ columns, rows = 5 }: TableSkeletonProps) => (
  <>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <tr key={rowIdx} className={tableRowStyle}>
        {Array.from({ length: columns }).map((_, colIdx) => (
          <td key={colIdx} className={tableCellBase}>
            <Loading.Skeleton className="h-[16px] w-full" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

Skeleton.displayName = "Table.Skeleton";
