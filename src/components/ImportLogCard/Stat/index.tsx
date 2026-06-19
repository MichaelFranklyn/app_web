import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import React from "react";
import { ImportColor } from "../Root/interface";
import { COLOR_TOKENS } from "../Root/style";

interface ImportLogCardStatProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode;
  label: string;
  color?: ImportColor;
}

export const Stat = React.forwardRef<HTMLDivElement, ImportLogCardStatProps>(
  ({ value, label, color, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center gap-[2px] rounded-(--r-md) border border-(--border) bg-(--bg3) p-[10px] text-center",
        className
      )}
      {...props}
    >
      <span
        className="font-head text-[19px] leading-none font-bold"
        style={{ color: color ? COLOR_TOKENS.text[color] : "var(--text)" }}
      >
        {value}
      </span>
      <Title variant="micro" color="muted">
        {label}
      </Title>
    </div>
  )
);

Stat.displayName = "ImportLogCard.Stat";
