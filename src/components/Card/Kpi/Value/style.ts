import { cva } from "class-variance-authority";

/** `info` é o azul do número que informa sem alarmar (sem visita há 30d). */
export type KpiStatus = "urgente" | "atencao" | "ok" | "info" | "neutral";

export const kpiValueStyle = cva(
  "font-bold text-(--text) leading-none tracking-[-0.04em] font-head",
  {
    variants: {
      status: {
        urgente: "text-(--red)",
        atencao: "text-(--amber)",
        ok: "text-(--green)",
        info: "text-(--blue)",
        neutral: "text-(--text)",
      },
      /** `sm` para valor que é TEXTO (data, revisão), não número. */
      size: {
        md: "text-[25px]",
        sm: "text-[16px]",
      },
    },
    defaultVariants: { status: "neutral", size: "md" },
  }
);
