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
}

export const InputContext = createContext<InputContextProps | null>(null);

export const useInputContext = () => {
  return useContext(InputContext);
};
