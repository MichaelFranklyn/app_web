import { createContext, useContext } from "react";
import { InputSize } from "./styles";

export interface InputContextProps {
  id?: string;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  inGroup?: boolean;
  size?: InputSize;
}

export const InputContext = createContext<InputContextProps | null>(null);

export const useInputContext = () => {
  return useContext(InputContext);
};
