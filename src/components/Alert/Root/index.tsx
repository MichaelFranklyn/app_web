import { cn } from "@/lib/utils";
import React from "react";
import { AlertRootProps } from "./interface";
import { alertRootStyles } from "./style";

/**
 * QUANDO USAR: aviso PRESO a um trecho da tela (formulário, seção, card) que
 * dura enquanto a condição durar. Condição da tela inteira (offline, sessão
 * emprestada) → `Banner`. Resultado passageiro de uma ação ("Pedido salvo")
 * → `useToast`. Variante: info/success/warning/error pelo SIGNIFICADO, nunca
 * pela cor. Regras: PATTERNS/ds-usage-rules.md.
 */
export const AlertRoot = React.forwardRef<HTMLDivElement, AlertRootProps>(
  ({ variant = "info", size = "md", className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertRootStyles.root,
        alertRootStyles.sizes[size],
        alertRootStyles.variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
AlertRoot.displayName = "AlertRoot";
