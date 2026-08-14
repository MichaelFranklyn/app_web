import { LucideIcon } from "lucide-react";

/** Um módulo do sistema como ele aparece na vitrine. `color` é uma variável CSS
 * (`var(--mod-*)`) para o cartão herdar a mesma cor que o módulo tem dentro do
 * sistema. */
export interface MarketingFeature {
  icon: LucideIcon;
  color: string;
  title: string;
  text: string;
}
