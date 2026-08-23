import { FormStepSchema } from "@/components/FormBuilder";

/**
 * Campos da conta de suporte. Não há escolha de papel: esta porta cria SUPPORT
 * e só — ver a explicação no `index.tsx`.
 *
 * O formato do e-mail é cobrado pelo tipo `email` do FormBuilder, não à mão: a
 * conta criada com endereço torto só apareceria como erro do backend, depois de
 * gasto o clique.
 */
export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "staff",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "name",
            type: "text",
            label: "Nome",
            placeholder: "Ex.: Ana Souza",
            required: true,
            maxLength: 255,
          },
          {
            name: "email",
            type: "email",
            label: "E-mail",
            placeholder: "ana@suaempresa.com",
            required: true,
            hint: "Será o login. A senha não é definida aqui — a pessoa cria a dela pelo link.",
          },
        ],
      },
    ],
  },
];

/** Tira os espaços das pontas antes de mandar ao backend. */
export const normalizeStaffInput = (data: Record<string, unknown>) => ({
  name: String(data.name ?? "").trim(),
  email: String(data.email ?? "").trim(),
});
