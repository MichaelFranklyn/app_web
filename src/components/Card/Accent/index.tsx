import { AccentDescription } from "./Description";
import { AccentLabel } from "./Label";
import { AccentRoot } from "./Root";
import { AccentTitle } from "./Title";

export type { CardAccentColor } from "./Root/interface";

export const Accent = Object.assign(AccentRoot, {
  Label: AccentLabel,
  Title: AccentTitle,
  Description: AccentDescription,
});
