import { cva } from "class-variance-authority";

/**
 * `neutral` (padrão) é o azul de dado: o número grande em preto deixava a fileira
 * de KPIs apagada (pedido do usuário, 14/11/2026). Azul é o tom neutro do DS —
 * âmbar fica para o que é clicável; verde/âmbar-aviso/vermelho seguem com
 * significado. `info` é o mesmo azul, mantido por quem já marca "informa sem
 * alarmar" (sem visita há 30d). `muted` é o zero que não pede nada: cinza, para
 * o azul do dado não chamar o olho para um contador vazio (crítica de
 * /priorities, 23/11/2026).
 */
export type KpiStatus =
  | "urgente"
  | "atencao"
  | "ok"
  | "info"
  | "neutral"
  | "muted";

export const kpiValueStyle = cva(
  "font-bold text-(--color-status-info) leading-none tracking-[-0.025em] font-head tabular-nums",
  {
    variants: {
      status: {
        urgente: "text-(--color-status-danger)",
        atencao: "text-(--color-status-warning)",
        ok: "text-(--color-status-success)",
        info: "text-(--color-status-info)",
        neutral: "text-(--color-status-info)",
        muted: "text-(--color-text-muted)",
      },
      /** `sm` para valor que é TEXTO (data, revisão), não número. */
      size: {
        // Encolhe com o cartão (13% da largura, entre 18 e 34px; o teto subiu
        // de 25 para 34 com a troca para a Figtree, 18/11/2026): em 2
        // colunas num celular de 375px sobram ~130px, e "R$ 12.345,67" a 25px
        // seria cortado pelo `overflow-hidden` do cartão. `anywhere` é a rede
        // para o valor que nem a 16px cabe — quebra em vez de sumir.
        md: "text-[length:clamp(18px,13cqi,34px)] [overflow-wrap:anywhere]",
        sm: "text-body-lg",
      },
    },
    defaultVariants: { status: "neutral", size: "md" },
  }
);
