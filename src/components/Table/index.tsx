import { Root } from "./Root";
import { Primitive } from "./Primitive";
import { Header } from "./Header";
import { Body } from "./Body";
import { Row } from "./Row";
import { Head } from "./Head";
import { Cell } from "./Cell";
import { CellText } from "./CellText";
import { ScoreCell } from "./ScoreCell";
import { CardHead } from "./CardHead";
import { Footer } from "./Footer";
import { Skeleton } from "./Skeleton";

export const Table = Object.assign(Root, {
  Root,
  Table: Primitive,
  Header,
  Body,
  Row,
  Head,
  Cell,
  CellText,
  ScoreCell,
  CardHead,
  Footer,
  Skeleton,
});
