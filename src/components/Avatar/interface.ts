import React from "react";
import { ThemeColor } from "@/lib/theme";
import { avatarStyles } from "./style";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof avatarStyles.sizes;
  color?: ThemeColor;
  src?: string;
  alt?: string;
  initials?: string;
}
