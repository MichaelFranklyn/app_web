import { cn } from "@/lib/utils";

export const getRootClasses = (className?: string): string =>
  cn("flex flex-col gap-16", className);
