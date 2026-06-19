import { cn } from "@/lib/utils";
import React from "react";
import { TopbarStatusProps } from "./interface";
import { getStatusClasses } from "./style";

export const TopbarStatus = React.forwardRef<HTMLDivElement, TopbarStatusProps>(
  ({ label = "API conectada", variant = "online", className, ...props }, ref) => {
    const styles = getStatusClasses(variant);
    return (
      <div ref={ref} className={cn(styles.root, className)} {...props}>
        <span className={styles.dot} />
        {label}
      </div>
    );
  }
);

TopbarStatus.displayName = "Topbar.Status";
