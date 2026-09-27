import { LucideIcon } from "lucide-react";

export interface MigrationStep {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  action: string;
}
