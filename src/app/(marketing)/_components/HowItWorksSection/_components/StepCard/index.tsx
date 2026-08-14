import { Title } from "@/components/Title";

/**
 * Um passo da migração. O número vem grande e em âmbar porque a leitura em
 * diagonal precisa mostrar "são só três" antes de qualquer palavra.
 */
export function StepCard({
  number,
  title,
  text,
}: {
  number: number;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col gap-8 rounded-(--radius-md) border border-(--border) bg-(--bg2) p-24">
      <Title variant="kpi" color="amber">
        {number}
      </Title>

      <Title variant="heading-md">{title}</Title>

      <Title variant="body-sm" color="muted">
        {text}
      </Title>
    </div>
  );
}
