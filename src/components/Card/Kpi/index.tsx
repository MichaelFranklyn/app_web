import { KpiDelta } from "./Delta";
import { KpiLabel } from "./Label";
import { KpiRoot } from "./Root";
import { KpiValue } from "./Value";

export type { KpiStatus } from "./Value/style";

export const Kpi = Object.assign(KpiRoot, {
  Label: KpiLabel,
  Value: KpiValue,
  Delta: KpiDelta,
});
