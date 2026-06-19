"use client";

import { useContext } from "react";
import { ToastContext, ToastProvider } from "./Provider";

export const Toast = {
  ToastProvider,
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um Toast.Provider");
  }
  return context;
};

export * from "./Provider/interface";
