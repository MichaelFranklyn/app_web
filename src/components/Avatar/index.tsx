import { cn } from "@/lib/utils";
import React from "react";
import { AvatarProps } from "./interface";
import { avatarStyles } from "./style";

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      size = "md",
      color = "amber",
      src,
      alt,
      initials,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const displayContent =
      initials ?? children ?? (alt ? alt.substring(0, 2).toUpperCase() : null);

    return (
      <div
        ref={ref}
        className={cn(
          avatarStyles.root,
          avatarStyles.sizes[size],
          !src && avatarStyles.colors[color],
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt ?? "Avatar"} className={avatarStyles.image} />
        ) : (
          <span>{displayContent}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
