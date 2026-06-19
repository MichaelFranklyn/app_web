import { Body } from "./Body";
import { Confidence } from "./Confidence";
import { File } from "./File";
import { Footer } from "./Footer";
import { Head } from "./Head";
import { Info } from "./Info";
import { Root } from "./Root";
import { Stat } from "./Stat";
import { Stats } from "./Stats";
import { Status } from "./Status";

export const ImportLogCard = Object.assign(Root, {
  Root,
  Head: Object.assign(Head, {
    File,
    Info,
    Status,
  }),
  Body,
  Footer,
  Confidence,
  Stats,
  Stat,
});
