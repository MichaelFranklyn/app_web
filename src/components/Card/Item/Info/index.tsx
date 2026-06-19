import { ItemInfoRoot } from "./Root";
import { ItemName } from "./Name";
import { ItemSub } from "./Sub";

export const ItemInfo = Object.assign(ItemInfoRoot, {
  Name: ItemName,
  Sub: ItemSub,
});
