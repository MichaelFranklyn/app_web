import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import React from "react";

export type ScoreColor = "red" | "amber" | "green" | "blue" | "cyan";

export const SCORE_COLOR_TOKENS: Record<ScoreColor, string> = {
  red: "var(--red)",
  amber: "var(--amber)",
  green: "var(--green)",
  blue: "var(--blue)",
  cyan: "var(--cyan)",
};

export interface ScoreCardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  score: number;
  color: ScoreColor;
}

export const Root = ({
  title,
  score,
  color,
  children,
  className,
  ...props
}: ScoreCardRootProps) => (
  <Card.Root className={cn(className)} {...props}>
    <Card.Header>
      <Card.Header.Title size="sm" weight="semibold">{title}</Card.Header.Title>
      <Card.Header.Actions>
        <Title
          variant="heading-md"
          style={{ color: SCORE_COLOR_TOKENS[color] }}
          className="leading-none"
        >
          {score}
        </Title>
      </Card.Header.Actions>
    </Card.Header>

    <Card.Body>
      <div className="flex flex-col gap-[10px]">{children}</div>
    </Card.Body>
  </Card.Root>
);

Root.displayName = "ScoreCard.Root";
