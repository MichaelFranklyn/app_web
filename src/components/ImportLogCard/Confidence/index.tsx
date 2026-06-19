import { Progress } from "@/components/Progress";
import { cn } from "@/lib/utils";
import { ImportColor } from "../Root/interface";

interface ImportLogCardConfidenceProps {
  value: number;
  color?: ImportColor;
  label?: string;
  className?: string;
}

export const Confidence = ({
  value,
  color = "amber",
  label = "Confiança da extração",
  className,
}: ImportLogCardConfidenceProps) => (
  <Progress.Root className={cn("mb-3", className)}>
    <Progress.Header>
      <Progress.Label>{label}</Progress.Label>
      <Progress.Value color={color}>{value}%</Progress.Value>
    </Progress.Header>
    <Progress.Bar value={value} color={color} />
  </Progress.Root>
);

Confidence.displayName = "ImportLogCard.Confidence";
