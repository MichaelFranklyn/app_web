import { createContext, useContext } from "react";

export interface InputContextProps {
  id?: string;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  inGroup?: boolean;
}

export const InputContext = createContext<InputContextProps | null>(null);

export const useInputContext = () => {
  return useContext(InputContext);
};
