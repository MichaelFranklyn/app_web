import { createContext, useContext } from "react";

export const DrawerContext = createContext<{ onClose: () => void } | null>(
  null
);

export const useDrawer = () => useContext(DrawerContext);
