"use client";

import { Alert } from "@/components/Alert";
import { Card } from "@/components/Card";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { plural, pluralWord } from "@/utils/format/plural";
import { Info } from "lucide-react";

import { CreateMissingOptions } from "../../../_components/CreateMissingOptions";
import { MatchOption } from "../../../interface";
import { STATUS_OPTIONS } from "../../../utils";
import { ValueMatchRow } from "../ValueMatchRow";

interface Props {
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  factoryValues: string[];
  factoryOptions: MatchOption[];
  factoryMatches: Record<string, string | null>;
  onFactoryMatch: (value: string, id: string | null) => void;
  hasSellerColumn: boolean;
  sellerValues: string[];
  sellerOptions: MatchOption[];
  sellerMatches: Record<string, string | null>;
  onSellerMatch: (value: string, id: string | null) => void;
  defaultSellerId: string | null;
  onDefaultSeller: (id: string | null) => void;
  hasStatusColumn: boolean;
  statusValues: string[];
  statusMatches: Record<string, string | null>;
  onStatusMatch: (value: string, id: string | null) => void;
  createClients: boolean;
  onCreateClients: (value: boolean) => void;
  createProducts: boolean;
  onCreateProducts: (value: boolean) => void;
  pending: number;
}

export function StepMatch(props: Props) {
  if (props.loading && props.factoryOptions.length === 0) {
    return <Loading.Skeleton className="h-[200px] w-full" />;
  }
  if (props.error && props.factoryOptions.length === 0) {
    return <QueryError flat onRetry={props.onRetry} />;
  }

  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro step={3} total={4} title="Diga quem é quem">
        A planilha escreve as fábricas, os vendedores e os status do jeito dela.
        Para cada nome, escolha o correspondente aqui. Os parecidos já vêm
        escolhidos.
      </Stepper.Intro>
      {props.pending > 0 && (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Description>
              {plural(props.pending, "nome", "nomes")} sem correspondente. As
              linhas {pluralWord(props.pending, "dele ficam", "deles ficam")} de
              fora da importação.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      <Card.Root inset tone="transparent">
        <Card.Body padding="sm">
          <Title variant="micro" color="muted">
            Fábricas
          </Title>
          {props.factoryValues.map((value) => (
            <ValueMatchRow
              key={value}
              value={value}
              options={props.factoryOptions}
              selectedId={props.factoryMatches[value] ?? null}
              onChange={(id) => props.onFactoryMatch(value, id)}
              placeholder="Escolha a fábrica"
            />
          ))}
        </Card.Body>
      </Card.Root>
      <Card.Root inset tone="transparent">
        <Card.Body padding="sm">
          <Title variant="micro" color="muted">
            Vendedores
          </Title>
          {props.hasSellerColumn ? (
            props.sellerValues.map((value) => (
              <ValueMatchRow
                key={value}
                value={value}
                options={props.sellerOptions}
                selectedId={props.sellerMatches[value] ?? null}
                onChange={(id) => props.onSellerMatch(value, id)}
                placeholder="Escolha o vendedor"
              />
            ))
          ) : (
            <ValueMatchRow
              value="Todos os pedidos"
              options={props.sellerOptions}
              selectedId={props.defaultSellerId}
              onChange={props.onDefaultSeller}
              placeholder="Escolha o vendedor"
            />
          )}
        </Card.Body>
      </Card.Root>
      {props.hasStatusColumn && (
        <Card.Root inset tone="transparent">
          <Card.Body padding="sm">
            <Title variant="micro" color="muted">
              Status
            </Title>
            {props.statusValues.map((value) => (
              <ValueMatchRow
                key={value}
                value={value}
                options={STATUS_OPTIONS}
                selectedId={props.statusMatches[value] ?? null}
                onChange={(id) => props.onStatusMatch(value, id)}
                placeholder="Escolha o status"
              />
            ))}
          </Card.Body>
        </Card.Root>
      )}
      <CreateMissingOptions
        createClients={props.createClients}
        onCreateClients={props.onCreateClients}
        createProducts={props.createProducts}
        onCreateProducts={props.onCreateProducts}
      />
    </div>
  );
}
