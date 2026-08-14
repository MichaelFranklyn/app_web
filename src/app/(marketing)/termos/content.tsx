import { LegalArticle } from "../_components/LegalArticle";
import { TERMS_SECTIONS } from "./utils";

export default function TermsContent() {
  return (
    <LegalArticle
      title="Termos de uso"
      intro="Estas são as regras de uso do Girus. Elas valem para a empresa que contrata o serviço e para cada pessoa que recebe um acesso dentro dele."
      sections={TERMS_SECTIONS}
    />
  );
}
