import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { activityLabel, activityTone, daysSinceLogin } from "../../../utils";

const TONE_COLOR = {
  ok: "green",
  atencao: "amber",
  urgente: "red",
  neutral: "muted",
} as const;

/**
 * Há quanto tempo alguém da empresa não entra.
 *
 * É a coluna que responde "esta conta está viva?" — mais informativa que a
 * data crua, porque ninguém lê "12/06/2026" e calcula de cabeça que são dois
 * meses. A cor faz o trabalho de varredura: o SU passa o olho e vê onde olhar.
 */
export function ActivityCell({ lastLoginAt }: { lastLoginAt: string | null }) {
  const days = daysSinceLogin(lastLoginAt);
  const tone = activityTone(days);

  return (
    <Table.Cell className="whitespace-nowrap">
      <Title
        variant="body-sm"
        color={TONE_COLOR[tone]}
        weight={tone === "urgente" ? "semibold" : "regular"}
      >
        {activityLabel(days)}
      </Title>
    </Table.Cell>
  );
}
