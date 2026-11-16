"use client";

import { useContext } from "react";
import { ToastContext, ToastProvider } from "./Provider";

export const Toast = {
  ToastProvider,
};

/**
 * QUANDO USAR: retorno PASSAGEIRO de uma ação que o usuário acabou de fazer
 * (salvou, excluiu, falhou ao enviar). Some sozinho — então nada que ele
 * precise reler ou decidir. Condição que persiste → `Alert.Root` (trecho) ou
 * `Banner` (tela inteira). Regras: PATTERNS/ds-usage-rules.md.
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um Toast.Provider");
  }
  return context;
};

export * from "./Provider/interface";
