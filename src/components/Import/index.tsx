import { FieldMapper } from "./FieldMapper";
import { Reconciliation } from "./Reconciliation";
import { SheetPreview } from "./SheetPreview";
import { Summary } from "./Summary";
import { TemplateDownload } from "./TemplateDownload";

export { FieldMapper } from "./FieldMapper";
export { Reconciliation } from "./Reconciliation";
export { SheetPreview } from "./SheetPreview";
export { Summary } from "./Summary";
export { TemplateDownload } from "./TemplateDownload";
export type { ImportSummaryDetail, ImportSummaryResult } from "./Summary";

// Toolkit de importação de planilhas, compartilhado entre features (factories,
// orders, etc.). Use o namespace `Import.FieldMapper` ou os exports nomeados.
export const Import = {
  FieldMapper,
  Reconciliation,
  SheetPreview,
  Summary,
  TemplateDownload,
};
