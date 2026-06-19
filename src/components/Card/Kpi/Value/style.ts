import { cva } from "class-variance-authority";

export type KpiStatus = "urgente" | "atencao" | "ok" | "neutral";

export const kpiValueStyle = cva(
  "text-[25px] font-bold text-(--text) leading-none tracking-[-0.04em] font-head",
  {
    variants: {
      status: {
        urgente: "text-(--red)",
        atencao: "text-(--amber)",
        ok: "text-(--green)",
        neutral: "text-(--text)",
      },
    },
    defaultVariants: { status: "neutral" },
  }
);
