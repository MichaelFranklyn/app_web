import { ItemActions } from "./Actions";
import { ItemAvatar } from "./Avatar";
import { ItemInfo } from "./Info";
import { ItemLabel } from "./Label";
import { ItemRoot } from "./Root";
import { ItemAction } from "./Tag";
import { ItemValue } from "./Value";

export const Item = Object.assign(ItemRoot, {
  Avatar: ItemAvatar,
  Info: ItemInfo,
  Action: ItemAction,
  Label: ItemLabel,
  Value: ItemValue,
  Actions: ItemActions,
});
