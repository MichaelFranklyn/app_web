import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { Seller } from "../interface";
import {
  CREATE_SELLER_MUTATION,
  SELLERS_USER_IDS_QUERY,
  USERS_OPTIONS_QUERY,
} from "./gql";
import {
  CreateSellerResponse,
  SellersUserIdsData,
  UsersOptionsData,
} from "./interface";
import { FORM_STEPS, normalizeInput } from "./utils";

const LIST_INPUT = { first: 200 };

export interface AddSellerModalProps {
  onAddOptimistic: (seller: Seller) => void;
}

export function useAddSeller({ onAddOptimistic }: AddSellerModalProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();

  const { data: usersData } = useQuery<UsersOptionsData>(USERS_OPTIONS_QUERY, {
    variables: { input: LIST_INPUT },
    skip: !open,
  });

  const { data: sellersData } = useQuery<SellersUserIdsData>(
    SELLERS_USER_IDS_QUERY,
    { variables: { input: LIST_INPUT }, skip: !open }
  );

  const existingSellerUserIds = useMemo(() => {
    if (!sellersData) return new Set<string>();
    return new Set(
      sellersData.sellers_user_ids.edges.map(({ node }) => node.userId)
    );
  }, [sellersData]);

  const userOptions = useMemo(
    () =>
      usersData?.users_for_seller?.edges
        ?.filter(({ node }) => !existingSellerUserIds.has(node.id))
        .map(({ node }) => ({
          label: `${node.name} — ${node.email}`,
          value: node.id,
        })) ?? [],
    [usersData, existingSellerUserIds]
  );

  const userMap = useMemo(() => {
    const map = new Map<string, { name: string; email: string }>();
    usersData?.users_for_seller?.edges?.forEach(({ node }) =>
      map.set(node.id, { name: node.name, email: node.email })
    );
    return map;
  }, [usersData]);

  const formSteps = useMemo<FormStepSchema[]>(() => {
    const [identificationSection, addressSection] =
      FORM_STEPS[0].sections ?? [];

    const identificationFields = (identificationSection.fields ?? []).map(
      (field) => {
        if (field.name === "name" || field.name === "email") {
          return { ...field, disabled: !!selectedUserId };
        }
        return field;
      }
    );

    return [
      {
        id: "user-selection",
        sections: [
          {
            id: "user",
            title: "Usuário existente",
            fields: [
              {
                name: "existingUser",
                type: "select-single",
                label: "Usuário (opcional)",
                placeholder: "Selecione um usuário para pré-preencher os dados",
                options: userOptions,
                onChange: (value, setValue) => {
                  const selected = value as { value: string } | null;
                  const userId = selected?.value ?? null;
                  setSelectedUserId(userId);
                  if (userId) {
                    const user = userMap.get(userId);
                    if (user) {
                      setValue("name", user.name);
                      setValue("email", user.email);
                    }
                  } else {
                    setValue("name", "");
                    setValue("email", "");
                  }
                },
              },
            ],
          },
        ],
      },
      {
        id: "identification",
        sections: [{ ...identificationSection, fields: identificationFields }],
      },
      {
        id: "address",
        sections: [addressSection],
      },
    ];
  }, [userOptions, userMap, selectedUserId]);

  const isLastStep = currentStep === formSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = async () => {
    const advanced = await formRef.current?.nextStep();
    if (advanced) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    formRef.current?.prevStep();
    setCurrentStep((prev) => prev - 1);
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setCurrentStep(0);
      setSelectedUserId(null);
    }
  };

  const [createSeller] = useMutation<CreateSellerResponse>(
    CREATE_SELLER_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeInput(data);

    await execute(
      async () => {
        const res = await createSeller({ variables: { input: normalized } });

        if (!res.data?.createSeller?.status || !res.data.createSeller.data) {
          throw new Error(
            res.data?.createSeller?.message ?? "Erro ao cadastrar vendedor"
          );
        }

        return res.data.createSeller.data;
      },
      {
        successMessage: "Vendedor cadastrado com sucesso",
        onSuccess: async (newSeller) => {
          setOpen(false);
          setCurrentStep(0);
          setSelectedUserId(null);
          formRef.current?.resetForm();
          onAddOptimistic({ ...newSeller, email: "" });
          await invalidateClient(["sellers_list"]);
        },
      }
    );
  };

  return {
    open,
    handleOpenChange,
    isFirstStep,
    isLastStep,
    formRef,
    formSteps,
    handleSubmit,
    handleNext,
    handlePrev,
    isLoading,
  };
}
