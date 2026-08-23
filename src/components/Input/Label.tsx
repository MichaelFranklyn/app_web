"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { useInputContext } from "./context";
import { inputStyles } from "./styles";

/**
 * Asterisco de campo obrigatório.
 *
 * Exportado porque nem todo label do app é `InputLabel`: os grupos do
 * FormBuilder (checkbox, radio, switch) desenham o próprio, e a marca tem de
 * ser a mesma em todos — senão "obrigatório" passa a significar coisas
 * diferentes em telas diferentes.
 *
 * O asterisco é `aria-hidden` e vem acompanhado de texto para leitor de tela:
 * um "*" lido em voz alta não diz nada a quem não vê a convenção.
 */
export const RequiredMark = () => (
  <>
    <span aria-hidden="true" className="ml-4 text-(--red)">
      *
    </span>
    <span className="sr-only">(obrigatório)</span>
  </>
);

interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  /**
   * Marca o campo como obrigatório. Normalmente não precisa ser passado: o
   * valor vem do `InputRoot` pelo contexto (que por sua vez recebe do
   * `required` do input). A prop existe para os labels desenhados FORA de um
   * `InputRoot` — os grupos do FormBuilder.
   */
  required?: boolean;
}

export const InputLabel = ({
  children,
  className,
  required,
  ...props
}: InputLabelProps) => {
  const context = useInputContext();
  const isRequired = required ?? context?.required ?? false;

  return (
    <label
      htmlFor={context?.id}
      className={cn(inputStyles.label, className)}
      {...props}
    >
      {children}
      {isRequired && <RequiredMark />}
    </label>
  );
};
