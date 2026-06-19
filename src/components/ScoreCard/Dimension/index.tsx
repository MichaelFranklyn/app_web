import { Progress } from "@/components/Progress";
import { cn } from "@/lib/utils";
import { ScoreColor } from "../Root";

export interface ScoreCardDimensionProps {
  label: string;
  value: number;
  color: ScoreColor;
  className?: string;
}

export const Dimension = ({
  label,
  value,
  color,
  className,
}: ScoreCardDimensionProps) => (
  <Progress.Root className={cn(className)}>
    <Progress.Header>
      <Progress.Label>{label}</Progress.Label>
      <Progress.Value color={color}>{value}</Progress.Value>
    </Progress.Header>
    <Progress.Bar value={value} color={color} />
  </Progress.Root>
);

Dimension.displayName = "ScoreCard.Dimension";
