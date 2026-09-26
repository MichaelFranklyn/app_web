import { Accent } from "./Accent";
import { Body } from "./Body";
import { Button } from "./Button";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Item } from "./Item";
import { Kpi } from "./Kpi";
import { Root } from "./Root";
import { Row } from "./Row";
import { Section } from "./Section";

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
  Section,
  Row,
  Button,
  Footer,
  Kpi,
  Accent,
  Item,
});
