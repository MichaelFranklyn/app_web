"use client";

import { createContext, useContext } from "react";
import { ButtonSize } from "./interface";

export interface ButtonContextProps {
  size: ButtonSize;
  isIconOnly: boolean;
  loading: boolean;
}

export const ButtonContext = createContext<ButtonContextProps | null>(null);

export const useButtonContext = () => {
  const ctx = useContext(ButtonContext);
  if (!ctx)
    throw new Error("useButtonContext must be used within a Button.Root");
  return ctx;
};
