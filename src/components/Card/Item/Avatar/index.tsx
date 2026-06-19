import { Avatar } from "@/components/Avatar";
import React from "react";
import { CardItemAvatarProps } from "./interface";

export const ItemAvatar = React.forwardRef<HTMLDivElement, CardItemAvatarProps>(
  (props, ref) => <Avatar ref={ref} size="md" {...props} />
);

ItemAvatar.displayName = "Card.Item.Avatar";
