import type React from "react";
import { createContext, useContext } from "react";
import { InputSize } from "./styles";

export interface InputContextProps {
  id?: string;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  inGroup?: boolean;
  size?: InputSize;
  /** Campo obrigatório: o label ganha asterisco e o controle, `aria-required`. */
  required?: boolean;
  /**
   * id do `InputHint` quando ele está na tela (vazio quando não há dica). O
   * controle aponta para ele em `aria-describedby`: sem isso o leitor de tela
   * anuncia "campo inválido" mas não lê a mensagem que explica o porquê.
   */
  hintId?: string;
  /** O `InputHint` se registra ao montar e se retira ao desmontar. */
  registerHint?: (mounted: boolean) => void;
}

export const InputContext = createContext<InputContextProps | null>(null);

export const useInputContext = () => {
  return useContext(InputContext);
};

/**
 * Atributos de acessibilidade que ligam o controle ao estado do campo:
 * `aria-invalid` no erro e `aria-describedby` apontando para a dica/mensagem.
 * Um id passado pela tela em `aria-describedby` é somado, não substituído.
 */
export function fieldAria(
  context: InputContextProps | null,
  props: {
    "aria-invalid"?: React.AriaAttributes["aria-invalid"];
    "aria-describedby"?: string;
  }
) {
  const describedBy =
    [props["aria-describedby"], context?.hintId].filter(Boolean).join(" ") ||
    undefined;
  return {
    "aria-invalid": props["aria-invalid"] ?? (context?.error || undefined),
    "aria-describedby": describedBy,
  };
}
