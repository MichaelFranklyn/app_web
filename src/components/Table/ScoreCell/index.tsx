import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import React from "react";
import { tableCellBase } from "../Cell/style";
import { deriveScoreColor } from "../utils";
import { TableScoreCellProps } from "./interface";
import { SCORE_COLOR_MAP, SCORE_TEXT_COLOR_MAP } from "./style";

export const ScoreCell = React.forwardRef<
  HTMLTableCellElement,
  TableScoreCellProps
>(({ score, color, noBar, label, className, children, ...props }, ref) => {
  const resolvedColor = color ?? deriveScoreColor(score);
  const cssColor = SCORE_COLOR_MAP[resolvedColor];
  const textColor = SCORE_TEXT_COLOR_MAP[resolvedColor];
  const pct = Math.min(100, Math.max(0, score));

  return (
    <td ref={ref} className={cn(tableCellBase, className)} {...props}>
      <div className="flex items-center gap-4">
        {/* No cartão (`Table.Table cards`) a célula vira inline-flex e o
            `flex-1` sozinho deixava a barra com 0px: daí o `min-w-64`. */}
        {!noBar && (
          <div className="max-desktop:min-w-64 h-4 flex-1 overflow-hidden rounded-[2px] bg-(--bg4)">
            <div
              className="h-full rounded-[2px] transition-[width] duration-400"
              style={{ width: `${pct}%`, background: cssColor }}
            />
          </div>
        )}
        <Title
          variant="value"
          className="text-right"
          style={{ color: textColor }}
        >
          {label ?? score}
        </Title>
        {children}
      </div>
    </td>
  );
});

ScoreCell.displayName = "Table.ScoreCell";
