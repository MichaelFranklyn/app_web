import { Actions } from "./Actions";
import { Description } from "./Description";
import { Eyebrow } from "./Eyebrow";
import { Heading } from "./Heading";
import { HeadingSkeleton } from "./HeadingSkeleton";
import { Root } from "./Root";
import { Tags } from "./Tags";
import { Title } from "./Title";
import { Left, Top } from "./Top";

export const PanelHeader = Object.assign(Root, {
  Root,
  Top,
  Left,
  Eyebrow,
  Title,
  Heading,
  HeadingSkeleton,
  Description,
  Actions,
  Tags,
});
