import { LucideIcon } from "lucide-react";

/** O recorte de um print que ilustra o cartão (ver `ScreenCrop`). */
export interface FeatureShot {
  src: string;
  alt: string;
  zoom: number;
  x: number;
  y: number;
}

/** Um módulo do sistema como ele aparece no bento. `color` é uma variável CSS
 * (`var(--mod-*)`) para o cartão herdar a mesma cor que o módulo tem dentro do
 * sistema. `size` é o tamanho na grade: `big` (2×2), `wide` (2×1) ou o
 * cartão simples. Só os maiores levam print. */
export interface MarketingFeature {
  icon: LucideIcon;
  color: string;
  title: string;
  text: string;
  size?: "big" | "wide";
  shot?: FeatureShot;
}
