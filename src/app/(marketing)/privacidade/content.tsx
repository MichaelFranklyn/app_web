import { LegalArticle } from "../_components/LegalArticle";
import { PRIVACY_SECTIONS } from "./utils";

export default function PrivacyContent() {
  return (
    <LegalArticle
      title="Política de privacidade"
      intro="Este documento explica quais dados o Girus trata, por quê, com quem eles são compartilhados e o que você pode exigir a respeito deles."
      sections={PRIVACY_SECTIONS}
    />
  );
}
