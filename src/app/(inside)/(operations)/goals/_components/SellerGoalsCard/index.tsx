"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Divider } from "@/components/Divider";
import { SelectOption } from "@/components/Input";
import { Title } from "@/components/Title";
import { factoryName } from "@/utils/company";
import { useMutation } from "@apollo/client/react";
import { Pencil, Trash2 } from "lucide-react";

import { DELETE_SELLER_GOAL_MUTATION } from "../../gql";
import { GoalRow } from "../../interface";
import { SellerGroup } from "../../utils";
import { GoalMetricBars } from "../GoalMetricBars";
import { SetGoalModal } from "../SetGoalModal";
import { DeleteGoalResponse } from "../SetGoalModal/interface";

interface Props {
  group: SellerGroup;
  periodMonthIso: string;
  /** Gestor: pode definir, ajustar e remover metas. Vendedor só acompanha. */
  canManage: boolean;
  sellerOptions: SelectOption[];
  factoryOptions: SelectOption[];
  onChanged: () => void;
}

/**
 * As metas de um vendedor no mês, uma seção por fábrica. A leitura do gestor é
 * por pessoa ("como está o Rafael?"), e dentro dela por fábrica — que é o
 * recorte em que a cota é combinada.
 */
export function SellerGoalsCard({
  group,
  periodMonthIso,
  canManage,
  sellerOptions,
  factoryOptions,
  onChanged,
}: Props) {
  const [deleteGoal] = useMutation<DeleteGoalResponse>(
    DELETE_SELLER_GOAL_MUTATION
  );

  const removeGoal = async (row: GoalRow) => {
    const res = await deleteGoal({ variables: { id: row.goalId } });
    if (!res.data?.deleteSellerGoal?.status) {
      throw new Error(
        res.data?.deleteSellerGoal?.message ?? "Erro ao remover a meta"
      );
    }
    onChanged();
  };

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title>{group.sellerName}</Card.Header.Title>
        <Card.Header.Actions>
          {canManage && (
            <SetGoalModal
              periodMonthIso={periodMonthIso}
              fixedSellerId={group.sellerId}
              sellerOptions={sellerOptions}
              factoryOptions={factoryOptions}
              onSaved={onChanged}
            />
          )}
        </Card.Header.Actions>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-20">
          {group.rows.map((row, index) => (
            <div
              key={`${row.sellerId}-${row.factoryId}`}
              className="flex flex-col gap-12"
            >
              {index > 0 && <Divider.Root />}

              <div className="flex flex-wrap items-center justify-between gap-8">
                <div className="flex flex-wrap items-center gap-8">
                  <Title variant="body-sm" weight="medium">
                    {factoryName(row.factory)}
                  </Title>
                  {/* Vendeu sem meta combinada: é o convite para definir uma. */}
                  {!row.goalId && (
                    <Badge.Root appearance="tinted" color="neutral" size="xs">
                      <Badge.Text>Sem meta neste mês</Badge.Text>
                    </Badge.Root>
                  )}
                </div>

                {canManage && (
                  <div className="flex items-center gap-4">
                    <SetGoalModal
                      periodMonthIso={periodMonthIso}
                      row={row}
                      sellerOptions={sellerOptions}
                      factoryOptions={factoryOptions}
                      onSaved={onChanged}
                      trigger={
                        <Button.Root
                          appearance="ghost"
                          color="neutral"
                          size="sm"
                          isIconOnly
                          label={row.goalId ? "Ajustar meta" : "Definir meta"}
                        >
                          <Button.Icon icon={Pencil} />
                        </Button.Root>
                      }
                    />
                    {row.goalId && (
                      <ConfirmModal
                        title="Remover a meta desta fábrica?"
                        description="O acompanhamento do mês fica sem número combinado para esta fábrica. O que já foi vendido não muda."
                        confirmLabel="Remover meta"
                        onConfirm={() => removeGoal(row)}
                        successMessage="Meta removida"
                        trigger={
                          <Button.Root
                            appearance="ghost"
                            color="red"
                            size="sm"
                            isIconOnly
                            label="Remover meta"
                          >
                            <Button.Icon icon={Trash2} />
                          </Button.Root>
                        }
                      />
                    )}
                  </div>
                )}
              </div>

              <GoalMetricBars row={row} />
            </div>
          ))}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
