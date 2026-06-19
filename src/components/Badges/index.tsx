import { BadgeDot } from "./Dot";
import { BadgeIcon } from "./Icon";
import { BadgeRoot } from "./Root";
import { BadgeText } from "./Text";

export const Badge = Object.assign(BadgeRoot, {
  Root: BadgeRoot,
  Dot: BadgeDot,
  Text: BadgeText,
  Icon: BadgeIcon,
});
