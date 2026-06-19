import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import React from "react";
import { TopbarNotificationProps } from "./interface";
import { topbarNotificationStyles } from "./style";

export const TopbarNotification = React.forwardRef<
  HTMLButtonElement,
  TopbarNotificationProps
>(({ unread, className, ...props }, ref) => (
  <Button.Root
    ref={ref}
    {...props}
    type="button"
    appearance="outline"
    color="neutral"
    size="md"
    isIconOnly
    aria-label="Notificações"
    className={cn("relative", className)}
  >
    <Button.Icon icon={Bell} />
    {unread && <span className={topbarNotificationStyles.dot} />}
  </Button.Root>
));

TopbarNotification.displayName = "Topbar.Notification";
