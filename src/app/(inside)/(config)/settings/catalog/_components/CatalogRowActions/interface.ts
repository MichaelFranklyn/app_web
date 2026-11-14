import type { ReactNode } from "react";
import type { CatalogModalControl } from "../../interface";

export interface CatalogRowActionsProps {
  /** Nome do "⋯" para leitor de tela — diz de qual linha é. */
  label: string;
  editLabel: string;
  deleteLabel: string;
  renderEdit: (control: CatalogModalControl) => ReactNode;
  renderDelete: (control: CatalogModalControl) => ReactNode;
}
