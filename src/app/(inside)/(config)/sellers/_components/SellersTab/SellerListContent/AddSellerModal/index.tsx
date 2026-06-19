"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useMutation, useQuery } from "@apollo/client/react";
import { Info, Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Seller } from "../interface";
import {
  CREATE_SELLER_MUTATION,
  SELLERS_USER_IDS_QUERY,
  USERS_OPTIONS_QUERY,
} from "./gql";
import { FORM_STEPS, normalizeInput } from "./utils";

type CreateSellerResult = Omit<Seller, "email">;

interface CreateSellerResponse {
  createSeller: {
    status: boolean;
    message: string;
    data: CreateSellerResult | null;
  };
}

interface UsersOptionsData {
  users_for_seller: {
    edges: { node: { id: string; name: string; email: string } }[];
  };
}

interface SellersUserIdsData {
  sellers_user_ids: { edges: { node: { userId: string } }[] };
}

const LIST_INPUT = { first: 200 };

export function AddSellerModal({
  onAddOptimistic,
}: {
  onAddOptimistic: (seller: Seller) => void;
}) {
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
    const [identificationSection, addressSection] = FORM_STEPS[0].sections ?? [];

    const identificationFields = (identificationSection.fields ?? []).map((field) => {
      if (field.name === "name" || field.name === "email") {
        return { ...field, disabled: !!selectedUserId };
      }
      return field;
    });

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

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="md">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo Vendedor</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Cadastrar vendedor"
          description="Selecione um usuário existente para pré-preencher os dados, ou preencha manualmente."
        />

        <Modal.Body>
          {isFirstStep && (
            <Alert.Root variant="info" className="mb-16">
              <Alert.Icon icon={Info} />
              <Alert.Content>
                <Alert.Description>
                  Se o vendedor já tiver uma conta no sistema, selecione o usuário para vinculá-lo — nome e e-mail serão preenchidos automaticamente no próximo passo. Caso contrário, clique em <strong>Próximo</strong> e preencha os dados manualmente.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
          <FormBuilder
            ref={formRef}
            steps={formSteps}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
        </Modal.Body>

        <Modal.Footer>
          {isFirstStep ? (
            <Modal.Close asChild>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={isLoading}
              >
                <Button.Title>Cancelar</Button.Title>
              </Button.Root>
            </Modal.Close>
          ) : (
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
              onClick={handlePrev}
            >
              <Button.Title>← Voltar</Button.Title>
            </Button.Root>
          )}

          {isLastStep ? (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              loading={isLoading}
              onClick={() => formRef.current?.submitForm()}
            >
              <Button.Title>Cadastrar vendedor</Button.Title>
            </Button.Root>
          ) : (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              disabled={isLoading}
              onClick={handleNext}
            >
              <Button.Title>Próximo →</Button.Title>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
