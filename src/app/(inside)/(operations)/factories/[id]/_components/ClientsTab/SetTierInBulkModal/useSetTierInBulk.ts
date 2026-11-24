import { SelectOption } from "@/components/Input";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import {
  ClientCitiesData,
  ClientGroupBy,
  ClientGroupsData,
  FACTORY_CLIENT_CITIES_QUERY,
  FACTORY_CLIENT_GROUPS_QUERY,
  SET_TIER_IN_BULK_MUTATION,
  SetTierInBulkData,
} from "./gql";
import {
  BulkMode,
  UNGROUPED_KEY,
  cityKey,
  citiesToGroups,
  groupsToOptions,
  tierScope,
} from "./scope";

export interface SetTierInBulkModalProps {
  factoryId: string;
  tierOptions: SelectOption[];
  /** Depois de salvar: a tabela da aba relê os vínculos. */
  onDone: () => void;
}

export function useSetTierInBulk({
  factoryId,
  tierOptions,
  onDone,
}: SetTierInBulkModalProps) {
  const [open, setOpenState] = useState(false);
  const [by, setByState] = useState<ClientGroupBy>("CITY");
  const [mode, setMode] = useState<BulkMode>("only");
  const [selected, setSelected] = useState<SelectOption[]>([]);
  const [tier, setTier] = useState<SelectOption | null>(null);
  const { execute, isLoading } = useAsyncAction();

  // Rede sempre: a contagem muda a cada vínculo ou cadastro editado.
  const citiesQuery = useQuery<ClientCitiesData>(FACTORY_CLIENT_CITIES_QUERY, {
    variables: { factoryId },
    skip: !open || by !== "CITY",
    fetchPolicy: "network-only",
  });
  const groupsQuery = useQuery<ClientGroupsData>(FACTORY_CLIENT_GROUPS_QUERY, {
    variables: { factoryId, by },
    skip: !open || by === "CITY",
    fetchPolicy: "network-only",
  });
  const active = by === "CITY" ? citiesQuery : groupsQuery;

  const cities = useMemo(
    () => citiesQuery.data?.sellerClientFactoryCities?.data ?? [],
    [citiesQuery.data]
  );
  const groups = useMemo(() => {
    if (by === "CITY") return citiesToGroups(cities);
    return groupsToOptions(
      groupsQuery.data?.sellerClientFactoryGroups?.data ?? [],
      by
    );
  }, [by, cities, groupsQuery.data]);
  const groupOptions = useMemo<SelectOption[]>(
    () => groups.map((g) => ({ value: g.key, label: g.label })),
    [groups]
  );

  const [setTierInBulk] = useMutation<SetTierInBulkData>(
    SET_TIER_IN_BULK_MUTATION
  );

  const selectedKeys = selected.map((o) => String(o.value));
  const scope = tierScope(groups, selectedKeys, mode);
  const canSubmit = Boolean(tier) && selected.length > 0 && scope.affected > 0;

  // Trocar o critério zera a escolha: cidade e segmento não se misturam.
  const setBy = (value: ClientGroupBy) => {
    setByState(value);
    setSelected([]);
  };

  const setOpen = (value: boolean) => {
    setOpenState(value);
    if (!value) {
      setByState("CITY");
      setMode("only");
      setSelected([]);
      setTier(null);
    }
  };

  const selectionInput = () => {
    if (by === "CITY") {
      return {
        cities: cities
          .filter((c) => selectedKeys.includes(cityKey(c)))
          .map(({ city, state }) => ({ city, state })),
      };
    }
    return {
      groupIds: selectedKeys.filter((k) => k !== UNGROUPED_KEY),
      includeUngrouped: selectedKeys.includes(UNGROUPED_KEY),
    };
  };

  const handleSubmit = () =>
    execute(
      async () => {
        const res = await setTierInBulk({
          variables: {
            input: {
              factoryId,
              priceTierId: tier?.value,
              by,
              exceptSelected: mode === "except",
              ...selectionInput(),
            },
          },
        });
        const payload = res.data?.setSellerClientFactoriesPriceTier;
        if (!payload?.status) {
          throw new Error(
            payload?.message ?? "Não foi possível definir o nível."
          );
        }
        return payload;
      },
      {
        successMessage: (payload) => payload.message ?? undefined,
        onSuccess: () => {
          setOpen(false);
          onDone();
        },
      }
    );

  return {
    open,
    setOpen,
    by,
    setBy,
    mode,
    setMode,
    selected,
    setSelected,
    tier,
    setTier,
    tierOptions,
    groupOptions,
    groupsLoading: active.loading,
    groupsError: active.error,
    refetchGroups: active.refetch,
    scope,
    canSubmit,
    isLoading,
    handleSubmit,
  };
}
