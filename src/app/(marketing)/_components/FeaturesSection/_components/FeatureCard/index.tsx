import { IconTile } from "@/components/IconTile";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { ScreenCrop } from "../../../ScreenCrop";
import { MarketingFeature } from "../../interface";

/**
 * Cartão de um módulo no bento. O ícone carrega a cor do módulo; o resto do
 * cartão fica neutro, para as cores na mesma grade não virarem confete.
 *
 * Os cartões grandes terminam num recorte do print real que "sangra" até o
 * canto inferior direito — a tela parece continuar para fora do cartão.
 */
export function FeatureCard({
  icon: Icon,
  color,
  title,
  text,
  size,
  shot,
}: MarketingFeature) {
  return (
    <div
      className={cn(
        "flex flex-col gap-12 overflow-hidden rounded-(--r-lg) border border-(--border) bg-(--bg2) p-24",
        size === "big" && "tablet:col-span-2 desktop:row-span-2",
        size === "wide" && "tablet:col-span-2"
      )}
    >
      <IconTile color={color} size="lg" shape="square">
        <Icon />
      </IconTile>

      <Title as="h3" variant={size === "big" ? "heading-lg" : "heading-md"}>
        {title}
      </Title>

      <Title
        variant={size === "big" ? "body-md" : "body-sm"}
        color="muted"
        className="max-w-[48ch]"
      >
        {text}
      </Title>

      {shot && (
        <ScreenCrop
          {...shot}
          sizes="(min-width: 1200px) 1000px, 100vw"
          className={cn(
            "mt-auto -mr-24 -mb-24 ml-16",
            size === "big"
              ? "desktop:min-h-[300px] desktop:flex-1 h-[300px]"
              : "h-[150px]"
          )}
        />
      )}
    </div>
  );
}
