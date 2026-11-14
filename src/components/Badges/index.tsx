import { BadgeDot } from "./Dot";
import { BadgeIcon } from "./Icon";
import { BadgeContactType } from "./Preset/ContactType";
import { BadgeFixedVisit } from "./Preset/FixedVisit";
import { BadgeTrip } from "./Preset/Trip";
import { BadgeRoot } from "./Root";
import { BadgeText } from "./Text";

/**
 * Etiqueta de status. Os presets (`ContactType`, `FixedVisit`, `Trip`) são as
 * marcas da rotina — ícone + palavra + tom fixos — e substituíram as antigas
 * `*Tag` soltas (auditoria UX, item 9).
 */
export const Badge = Object.assign(BadgeRoot, {
  Root: BadgeRoot,
  Dot: BadgeDot,
  Text: BadgeText,
  Icon: BadgeIcon,
  ContactType: BadgeContactType,
  FixedVisit: BadgeFixedVisit,
  Trip: BadgeTrip,
});
