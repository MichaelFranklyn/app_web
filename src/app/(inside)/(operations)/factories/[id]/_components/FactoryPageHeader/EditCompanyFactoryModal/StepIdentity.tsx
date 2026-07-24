"use client";

import { InputText } from "@/components/Input";
import { LogoUpload } from "@/components/LogoUpload";
import { LogoValue } from "@/components/LogoUpload/interface";
import { factoryName } from "@/utils/company";
import { FactoryDetail } from "../../../interface";

interface Props {
  factory: FactoryDetail;
  nickname: string;
  onNicknameChange: (value: string) => void;
  logo: LogoValue;
  onLogoChange: (value: LogoValue) => void;
  disabled?: boolean;
}

/**
 * Primeiro passo da edição: como a fábrica se chama e se mostra PARA ESTA
 * EMPRESA. Fica fora do FormBuilder porque a logo não é um campo de formulário
 * comum — precisa de preview, troca e remoção.
 */
export function StepIdentity({
  factory,
  nickname,
  onNicknameChange,
  logo,
  onLogoChange,
  disabled,
}: Props) {
  const officialName = factoryName({
    nomeFantasia: factory.nomeFantasia,
    razaoSocial: factory.razaoSocial,
  });

  return (
    <div className="flex flex-col gap-20">
      <InputText
        label="Apelido"
        value={nickname}
        placeholder={officialName}
        maxLength={120}
        disabled={disabled}
        onChange={(event) => onNicknameChange(event.target.value)}
        hint={`Como você chama esta fábrica no dia a dia. Aparece no lugar do nome oficial nas telas e nos pedidos. Em branco, usa "${officialName}".`}
      />

      <LogoUpload
        currentUrl={factory.logoUrl}
        value={logo}
        onChange={onLogoChange}
        initials={factoryName(factory).slice(0, 2).toUpperCase()}
        disabled={disabled}
        label="Logo da fábrica"
      />
    </div>
  );
}
