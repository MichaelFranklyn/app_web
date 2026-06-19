import { FormStepSchema } from "@/components/FormBuilder";
import { MyProfile } from "../../interface";
import { UpdateMyProfileInput } from "./interface";

export const PROFILE_FORM_STEPS: FormStepSchema[] = [
  {
    id: "profile",
    sections: [
      {
        id: "identity",
        fields: [
          {
            name: "name",
            type: "text",
            label: "Nome",
            placeholder: "Seu nome completo",
            required: true,
          },
          {
            name: "email",
            type: "email",
            label: "E-mail",
            placeholder: "seu@email.com",
            required: true,
          },
        ],
      },
    ],
  },
];

export const normalizeProfile = (
  data: Record<string, unknown>,
  initial: MyProfile
): UpdateMyProfileInput => {
  const out: UpdateMyProfileInput = {};
  const name = String(data.name ?? "").trim();
  if (name && name !== initial.name) out.name = name;
  const email = String(data.email ?? "").trim().toLowerCase();
  if (email && email !== initial.email.toLowerCase()) out.email = email;
  return out;
};
