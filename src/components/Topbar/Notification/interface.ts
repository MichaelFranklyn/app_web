import React from "react";

export interface TopbarNotificationProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  unread?: boolean;
}
