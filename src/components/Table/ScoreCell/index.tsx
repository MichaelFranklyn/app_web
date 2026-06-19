import { cn } from "@/lib/utils";
import React from "react";
import { tableCellBase } from "../Cell/style";
import { deriveScoreColor } from "../utils";
import { TableScoreCellProps } from "./interface";
import { SCORE_COLOR_MAP } from "./style";

export const ScoreCell = React.forwardRef<
  HTMLTableCellElement,
  TableScoreCellProps
>(({ score, color, noBar, label, className, ...props }, ref) => {
  const resolvedColor = color ?? deriveScoreColor(score);
  const cssColor = SCORE_COLOR_MAP[resolvedColor];
  const pct = Math.min(100, Math.max(0, score));

  return (
    <td ref={ref} className={cn(tableCellBase, className)} {...props}>
      <div className="flex items-center gap-4">
        {!noBar && (
          <div className="h-4 flex-1 overflow-hidden rounded-[2px] bg-(--bg4)">
            <div
              className="h-full rounded-[2px] transition-[width] duration-400"
              style={{ width: `${pct}%`, background: cssColor }}
            />
          </div>
        )}
        <span
          className="font-head text-right text-[13px] font-bold"
          style={{ color: cssColor }}
        >
          {label ?? score}
        </span>
      </div>
    </td>
  );
});

ScoreCell.displayName = "Table.ScoreCell";
