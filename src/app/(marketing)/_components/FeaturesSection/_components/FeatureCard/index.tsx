import { Title } from "@/components/Title";
import { MarketingFeature } from "../../interface";

/**
 * Cartão de um módulo. O ícone carrega a cor do módulo; o resto do cartão fica
 * neutro, para oito cores na mesma grade não virarem confete.
 */
export function FeatureCard({
  icon: Icon,
  color,
  title,
  text,
}: MarketingFeature) {
  return (
    <div className="flex flex-col gap-12 rounded-(--radius-md) border border-(--border) bg-(--bg2) p-24">
      <span
        className="flex size-40 items-center justify-center rounded-(--radius-sm)"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
          color,
        }}
      >
        <Icon size={20} />
      </span>

      <Title variant="heading-md">{title}</Title>

      <Title variant="body-sm" color="muted">
        {text}
      </Title>
    </div>
  );
}
