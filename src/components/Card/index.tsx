import { Accent } from "./Accent";
import { Body } from "./Body";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Item } from "./Item";
import { Kpi } from "./Kpi";
import { Root } from "./Root";

// O status do KPI é escolhido por quem monta a faixa de números, então o tipo
// sai pelo mesmo barrel do componente.
export type { KpiStatus } from "./Kpi";

export const Card = Object.assign(Root, {
  Root,
  Header,
  HeaderEyebrow: Header.Eyebrow,
  HeaderTitle: Header.Title,
  HeaderDescription: Header.Description,
  HeaderActions: Header.Actions,
  Body,
  Footer,
  Kpi,
  Accent,
  Item,
});
