import { SelectOption } from "@/components/Input";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import {
  ClientCitiesData,
  FACTORY_CLIENT_CITIES_QUERY,
  SET_TIER_BY_CITY_MUTATION,
  SetTierByCityData,
} from "./gql";
import { CityMode, cityKey, cityLabel, tierScope } from "./scope";

export interface SetTierByCityModalProps {
  factoryId: string;
  tierOptions: SelectOption[];
  /** Depois de salvar: a tabela da aba relê os vínculos. */
  onDone: () => void;
}

export function useSetTierByCity({
  factoryId,
  tierOptions,
  onDone,
}: SetTierByCityModalProps) {
  const [open, setOpenState] = useState(false);
  const [mode, setMode] = useState<CityMode>("only");
  const [selected, setSelected] = useState<SelectOption[]>([]);
  const [tier, setTier] = useState<SelectOption | null>(null);
  const { execute, isLoading } = useAsyncAction();

  // Rede sempre: a contagem por cidade muda a cada vínculo criado ou editado.
  const citiesQuery = useQuery<ClientCitiesData>(FACTORY_CLIENT_CITIES_QUERY, {
    variables: { factoryId },
    skip: !open,
    fetchPolicy: "network-only",
  });
  const cities = useMemo(
    () => citiesQuery.data?.sellerClientFactoryCities?.data ?? [],
    [citiesQuery.data]
  );
  const cityOptions = useMemo<SelectOption[]>(
    () => cities.map((c) => ({ value: cityKey(c), label: cityLabel(c) })),
    [cities]
  );

  const [setTierByCity] = useMutation<SetTierByCityData>(
    SET_TIER_BY_CITY_MUTATION
  );

  const selectedKeys = selected.map((o) => String(o.value));
  const scope = tierScope(cities, selectedKeys, mode);
  const canSubmit = Boolean(tier) && selected.length > 0 && scope.affected > 0;

  const setOpen = (value: boolean) => {
    setOpenState(value);
    if (!value) {
      setMode("only");
      setSelected([]);
      setTier(null);
    }
  };

  const handleSubmit = () =>
    execute(
      async () => {
        const places = cities
          .filter((c) => selectedKeys.includes(cityKey(c)))
          .map(({ city, state }) => ({ city, state }));
        const res = await setTierByCity({
          variables: {
            input: {
              factoryId,
              priceTierId: tier?.value,
              cities: places,
              exceptCities: mode === "except",
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
    mode,
    setMode,
    selected,
    setSelected,
    tier,
    setTier,
    tierOptions,
    cityOptions,
    citiesLoading: citiesQuery.loading,
    citiesError: citiesQuery.error,
    refetchCities: citiesQuery.refetch,
    scope,
    canSubmit,
    isLoading,
    handleSubmit,
  };
}
