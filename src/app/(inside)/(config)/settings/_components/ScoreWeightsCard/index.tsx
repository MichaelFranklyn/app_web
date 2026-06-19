"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { InputNumber } from "@/components/Input";
import { Progress } from "@/components/Progress";
import { PriorityWeights } from "../../interface";
import { totalWeight, WEIGHT_DEFINITIONS } from "../../utils";

interface Props {
  weights: PriorityWeights;
  onChange: (weights: PriorityWeights) => void;
}

export function ScoreWeightsCard({ weights, onChange }: Props) {
  const total = totalWeight(weights);
  const isBalanced = total === 100;

  const handleWeightChange = (key: string, raw: string) => {
    const value = raw ? Math.max(0, Math.min(100, Number(raw))) : 0;
    onChange({ ...weights, [key]: value });
  };

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Pesos do score de visita
        </Card.Header.Title>
        <Card.Header.Actions>
          <Badge.Root color={isBalanced ? "green" : "red"} appearance="tinted">
            <Badge.Text>Total: {total}%</Badge.Text>
          </Badge.Root>
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-12">
          {WEIGHT_DEFINITIONS.map((w) => {
            const value = Number(weights[w.key] ?? w.defaultValue);
            return (
              <Progress.Root key={w.key}>
                <Progress.Header>
                  <Progress.Label>{w.label}</Progress.Label>
                  <div className="flex items-center gap-8">
                    <InputNumber
                      value={value}
                      onChange={(e) => handleWeightChange(w.key, e.target.value)}
                      min={0}
                      max={100}
                      containerClassName="w-[64px]"
                    />
                    <Progress.Value color={w.color}>{value}%</Progress.Value>
                  </div>
                </Progress.Header>
                <Progress.Bar value={value} color={w.color} />
              </Progress.Root>
            );
          })}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
