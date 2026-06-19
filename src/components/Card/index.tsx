import { Accent } from "./Accent";
import { Body } from "./Body";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Item } from "./Item";
import { Kpi } from "./Kpi";
import { Root } from "./Root";

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
