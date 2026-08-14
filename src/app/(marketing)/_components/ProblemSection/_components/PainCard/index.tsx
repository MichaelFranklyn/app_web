import { Title } from "@/components/Title";

/**
 * Um incômodo do dia a dia. Fundo neutro e sem ícone: a seção seguinte é que
 * ganha cor e ícone, e o contraste entre as duas é o que faz a virada de "isto
 * é o meu problema" para "isto resolve".
 */
export function PainCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-8 rounded-(--radius-md) border border-(--border) bg-(--bg) p-24">
      <Title variant="heading-sm">{title}</Title>

      <Title variant="body-sm" color="muted">
        {text}
      </Title>
    </div>
  );
}
