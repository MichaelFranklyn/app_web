import { cn } from "@/lib/utils";
import React from "react";
import { ImportColor } from "../Root/interface";
import { COLOR_TOKENS } from "../Root/style";

interface ImportLogCardFileProps extends React.HTMLAttributes<HTMLDivElement> {
  type: string;
  color?: ImportColor;
}

export const File = React.forwardRef<HTMLDivElement, ImportLogCardFileProps>(
  ({ type, color = "red", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center",
        "rounded-(--r-md) border text-[13px] font-medium",
        className
      )}
      style={{
        background: COLOR_TOKENS.bg[color],
        borderColor: COLOR_TOKENS.border[color],
        color: COLOR_TOKENS.text[color],
      }}
      {...props}
    >
      {type}
    </div>
  )
);

File.displayName = "ImportLogCard.File";
